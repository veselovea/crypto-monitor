using crypto_monitor_finder.dbEntities;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Text;
using System.Net.Http;
using System.Net.Http.Json;
using System.Net.Http.Headers;

namespace crypto_monitor_finder
{
    internal class Handler
    {
        private const string _apiUrl = "http://192.168.0.19:3000/api/devices/add";

        private SubnetDefine _subnet;
        private Thread[] _threads;
        private HttpClient _httpClient;

        public Handler()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic29tZUBleGFtcGxlIiwiaXNBY3RpdmF0ZWQiOmZhbHNlLCJpYXQiOjE2ODQ5NDkwNzgsImV4cCI6MTY4NTAzNTQ3OH0.4z7HMbxB09eTRZDdsPbuhMZoAQuC7PQs89j1znj0azQ");
            _subnet = new SubnetDefine();
            ThreadsCount = _subnet.Subnet.Length / 60 + 1;
            ThreadsCount = ThreadsCount == 0 ? ThreadsCount = 1 : ThreadsCount;
            _threads = new Thread[ThreadsCount];
        }

        public int ThreadsCount { get; }

        public void Start(Action<Device> callback, IPAddress[] addresses = null!)
        {
            addresses ??= _subnet.Subnet;
            for (int i = 0; i < ThreadsCount; i++)
            {
                int start = i * 60;
                int end = start + 60; end = end > addresses.Length ? addresses.Length : end;
                _threads[i] = new Thread(() => Handle(callback, addresses[start..end]));
                _threads[i].Start();
            }
        }

        public void TestStart(Action<Device> callback, IPAddress[] addresses = null!)
        {
            addresses ??= _subnet.Subnet;
            Handle(callback, addresses);
        }

        private async void Handle(Action<Device> callback, IPAddress[] addresses)
        {
            //string[] commands = { "version", "config", "summary", "pools", "notify", "devdetails", "stats", "coin", "asccount", "lcd" };
            string[] commands = { "summary", "stats", "pools" };
            foreach (IPAddress address in addresses)
            {
                Device device = new Device() { IsDevice = false, Mac = _subnet.GetMacFromIP(address) };
                device.Status = new DeviceStatus() { Ip = address.ToString() };
                bool connected = false;
                for (int i = 0; i < commands.Length; i++)
                {
                    TCPSocket soket = new TCPSocket();
                    connected = soket.Connect(address, 4028);
                    if (!connected)
                    {
                        soket.Disconnect();
                        break;
                    }
                    string temp = "{ \"command\":\"" + $"{commands[i]}\"" + " }";
                    var buffer = Encoding.ASCII.GetBytes(temp);
                    string? response = await soket.SendBuffer(buffer);
                    if (response == null)
                        break;
                    device = await ParseResult(device, response, commands[i]);
                    soket.Disconnect();
                }
                if (device.IsDevice)
                {
                    SendToServer(device);
                    callback?.Invoke(device);
                }
                if (!connected)
                    continue;
            }
        }

        private async void SendToServer(Device device)
        {
            HttpContent content = new StringContent(JsonConvert.SerializeObject(device, Formatting.Indented), Encoding.UTF8, "application/json");
            using HttpResponseMessage response = await _httpClient.PostAsync(_apiUrl, content);
            string responseText = await response.Content.ReadAsStringAsync();
        }

        private Task<Device> ParseResult(Device original, string response, string command)
        {
            response = response.Replace("}{", "},{");
            JObject? respObject = JsonConvert.DeserializeObject<JObject>(response);
            if (respObject == null)
                throw APIExceptions.NullResponse(original.Status.Ip, original.Mac);

            JToken statusKey = respObject.SelectToken("STATUS");
            if (statusKey == null)
                throw APIExceptions.NoStatusValue(original.Status.Ip, original.Mac);

            string status = statusKey[0].Value<string>("STATUS");
            int code = statusKey[0].Value<int>("Code");
            if (status == "E" && code == 45)
                throw APIExceptions.AccessDenied(command, original.Status.Ip, original.Mac);
            else if (status == "E")
            {
                string message = statusKey[0].Value<string>("Msg");
                throw APIExceptions.UnknownException(command, code, message, original.Status.Ip, original.Mac);
            }

            string description = statusKey[0].Value<string>("Description");
            JToken? body = respObject.SelectToken(command.ToUpper());
            if (body == null)
                throw APIExceptions.NoBody(original.Status.Ip, original.Mac);

            original.IsDevice = true;
            switch (command)
            {
                case "summary":
                    original = ParseSummaryCommand(body, original);
                    break;
                case "pools":
                    original = ParsePoolsCommand(body, original);
                    break;
                case "stats":
                    original = ParseStatsCommand(body, original, description.Contains("bmminer"));
                    break;
            }


            return Task.FromResult(original);
        }

        private Device ParseSummaryCommand(JToken body, Device original)
        {
            original.Status.Elapsed = body[0].Value<int>("Elapsed");

            // Почему-то bmminer выдаёт это значение строкой, а cgminer - числом
            string ghs5s = (string)body[0]["GHS 5s"];
            ghs5s = ghs5s == null || ghs5s == "" ? "0" : ghs5s.Replace('.', ',');
            original.Status.Ghs5s = Convert.ToSingle(ghs5s);

            original.Status.GhsAvg = body[0].Value<float>("GHS av");
            original.Status.Errors = body[0].Value<int>("Hardware Errors");
            
            return original;
        }

        private Device ParsePoolsCommand(JToken body, Device original)
        {
            int poolsCount = body.Count();
            original.Status.Pools = new Pool[poolsCount];
            for (int i = 0; i < poolsCount; i++)
            {
                original.Status.Pools[i] = new Pool();
                original.Status.Pools[i].PoolNum = body[i].Value<int>("POOL");
                original.Status.Pools[i].Url = body[i].Value<string>("URL");
                original.Status.Pools[i].Status = body[i].Value<string>("Status");
                original.Status.Pools[i].WorkerName = body[i].Value<string>("User");
            }

            return original;
        }

        private Device ParseStatsCommand(JToken body, Device original, bool isBmminer = false)
        {
            original.CompileTime = body[0].Value<string>("CompileTime");
            original.Model = body[0].Value<string>("Type");

            int miners = body[1].Value<int>("miner_count");
            int fans = body[1].Value<int>("fan_num");

            original.Status.Plats = new Plat[miners];
            original.Status.Coolers = new Cooler[fans];

            int numerationStart = 1;
            for (int i = 0; i < miners; i++)
            {
                original.Status.Plats[i] = new Plat();
                original.Status.Plats[i].PlatNum = i + 1;

                while (true)
                {
                    string key = $"chain_acn{numerationStart}";
                    int? chainAcn = body[1].Value<int>(key);
                    if (chainAcn != 0 && chainAcn != null)
                    {
                        original.Status.Plats[i].ChipCount = (int)chainAcn;
                        break;
                    }
                    else if (chainAcn == null)
                        throw APIExceptions.UnknownException("stats", 0, "chainAcn was null", original.Status.Ip, original.Mac);
                    numerationStart++;
                }

                original.Status.Plats[i].Rate = Convert.ToDecimal(body[1].Value<string>($"chain_rate{numerationStart}").Replace('.', ','));
                original.Status.Plats[i].RateIdeal = body[1].Value<decimal>($"chain_rateideal{numerationStart}");

                original.Status.Plats[i].PlatTemps = new PlatTemp[3];
                original.Status.Plats[i].PlatTemps[0] = new PlatTemp()
                {
                    TempName = "temp",
                    Prefix = 1,
                    Value = body[1].Value<double>($"temp{numerationStart}")
                };
                original.Status.Plats[i].PlatTemps[1] = new PlatTemp()
                {
                    TempName = "temp2_",
                    Prefix = 2,
                    Value = body[1].Value<double>($"temp2_{numerationStart}")
                };
                original.Status.Plats[i].PlatTemps[2] = new PlatTemp()
                {
                    TempName = "temp3_",
                    Prefix = 3,
                    Value = body[1].Value<double>($"temp3_{numerationStart}")
                };

                numerationStart++;
            }

            for (int i = 0; i < fans; i++)
            {
                original.Status.Coolers[i] = new Cooler();
                original.Status.Coolers[i].CoolerNum = i + 1;
                original.Status.Coolers[i].Speed = body[1].Value<double>($"fan{numerationStart - miners + i - (isBmminer ? 1 : 0)}");
            }

            original.RateIdeal = body[1].Value<double>("total_rateideal");

            string? rateUnit = body[0].Value<string>("RateUnit");
            rateUnit ??= body[1].Value<string>("rate_unit");
            rateUnit ??= "??";
            original.RateUnit = rateUnit;

            return original;
        }
    }
}
