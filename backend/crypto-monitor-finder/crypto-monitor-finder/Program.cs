using crypto_monitor_finder.dbEntities;
using Newtonsoft.Json;
using System.Net;

namespace crypto_monitor_finder
{
    internal class Program
    {
        static void Main(string[] args)
        {
            var handler = new Handler();
            handler.TestStart(Callback, new IPAddress[] { IPAddress.Parse("192.168.0.16") });
            //handler.TestStart(Callback);
            Console.ReadKey();
        }

        public static void Callback(Device device)
        {
            string json = JsonConvert.SerializeObject(device, Formatting.Indented);
            Console.WriteLine(json);
            Console.WriteLine(new string('=', 25));
        }
    }
}