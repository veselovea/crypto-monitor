using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Runtime.InteropServices;

namespace crypto_monitor_finder
{
    internal class SubnetDefine
    {
        public SubnetDefine()
        {
            Local = GetMyIP();
            Mask = GetSubnetMask(Local);
            Broadcast = GetBroadcast(Local, Mask);
            SubnetNumber = GetSubnetNumber(Local, Mask);
            Subnet = GetAllIPsInSubnet(SubnetNumber, Broadcast);
        }

        public IPAddress Local { get; private set; }
        public IPAddress Mask { get; private set; }
        public IPAddress Broadcast { get; private set; }
        public IPAddress SubnetNumber { get; private set; }
        public IPAddress[] Subnet { get; private set; }

        public IPAddress GetMyIP()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip;
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        [DllImport("iphlpapi.dll", ExactSpelling = true)]
        public static extern int SendARP(int DestinationIP, int SourceIP, [Out] byte[] pMacAddr, ref int PhyAddrLen);
        public string GetMacFromIP(IPAddress ip)
        {
            byte[] mac = new byte[6];
            int len = mac.Length;
            int response = SendARP(BitConverter.ToInt32(ip.GetAddressBytes(), 0), 0, mac, ref len);
            if (response != 0)
                throw new InvalidOperationException("SendARP failed");
            return BitConverter.ToString(mac, 0, len);
        }

        public IPAddress GetSubnetMask(IPAddress address)
        {
            foreach (NetworkInterface adapter in NetworkInterface.GetAllNetworkInterfaces())
            {
                foreach (UnicastIPAddressInformation unicastIPAddressInformation in adapter.GetIPProperties().UnicastAddresses)
                {
                    if (unicastIPAddressInformation.Address.AddressFamily == AddressFamily.InterNetwork)
                    {
                        if (address.Equals(unicastIPAddressInformation.Address))
                        {
                            return unicastIPAddressInformation.IPv4Mask;
                        }
                    }
                }
            }
            throw new ArgumentException(string.Format("Can't find subnetmask for IP address '{0}'", address));
        }

        public IPAddress GetBroadcast(IPAddress local, IPAddress mask)
        {
            uint localUInt = BitConverter.ToUInt32(local.GetAddressBytes(), 0);
            uint maskUInt = BitConverter.ToUInt32(mask.GetAddressBytes(), 0);

            uint topUInt = ~maskUInt | localUInt;

            topUInt = BitConverter.ToUInt32(BitConverter.GetBytes(topUInt).Reverse().ToArray());

            return IPAddress.Parse(topUInt.ToString());
        }

        public IPAddress GetSubnetNumber(IPAddress local, IPAddress mask)
        {
            uint localUInt = BitConverter.ToUInt32(local.GetAddressBytes(), 0);
            uint maskUInt = BitConverter.ToUInt32(mask.GetAddressBytes(), 0);

            uint bottomUInt = maskUInt & localUInt;

            bottomUInt = BitConverter.ToUInt32(BitConverter.GetBytes(bottomUInt).Reverse().ToArray());

            return IPAddress.Parse(bottomUInt.ToString());
        }

        public IPAddress[] GetAllIPsInSubnet(IPAddress subnetNumber, IPAddress broadcast)
        {
            uint start = BitConverter.ToUInt32(subnetNumber.GetAddressBytes().Reverse().ToArray(), 0);
            uint end = BitConverter.ToUInt32(broadcast.GetAddressBytes().Reverse().ToArray(), 0);
            uint amount = (~start & end) - 1;
            IPAddress[] subnet = new IPAddress[amount];

            uint i = 0;
            for (uint host = start + 1; host < end; host++)
            {
                subnet[i] = IPAddress.Parse(host.ToString());
                i++;
            }

            return subnet;
        }
    }
}
