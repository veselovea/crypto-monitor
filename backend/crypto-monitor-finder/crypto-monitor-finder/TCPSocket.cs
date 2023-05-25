using System.Net;
using System.Net.Sockets;
using System.Text;

namespace crypto_monitor_finder
{
    internal class TCPSocket
    {
        public const int BufferSize = 8192;

        private TcpClient _socket;

        public TCPSocket()
        {
            IPHostEntry host = Dns.GetHostEntry(Dns.GetHostName());
            _socket = new TcpClient(AddressFamily.InterNetwork);
            _socket.ReceiveBufferSize = BufferSize;
            _socket.SendBufferSize = BufferSize;
        }

        public void Close()
            => _socket.Close();

        public bool Connect(IPAddress address, ushort port)
        {
            IPEndPoint remote = new IPEndPoint(address, port);
            try
            {
                using (CancellationTokenSource tokenSource = new CancellationTokenSource(1000))
                    _socket.ConnectAsync(remote).Wait(tokenSource.Token);
            }
            catch (Exception e)
            {
                if (e.HResult != -2146233029)
                    throw;
                return false;
            }
            return true;
        }

        public async Task<string?> SendBuffer(byte[] buffer)
        {
            string? response = null;
            if (_socket.Connected)
            {
                await _socket.Client.SendAsync(buffer, SocketFlags.None);
                response = await Receive();
            }
            return response;
        }

        public async void Disconnect()
        {
            if (_socket.Connected)
                await _socket.Client.DisconnectAsync(true);
            _socket.Close();
        }

        private async Task<string> Receive()
        {
            List<byte[]> bytes = new List<byte[]>();
            byte[] buffer = new byte[BufferSize];
            do
            {
                await _socket.Client.ReceiveAsync(buffer, SocketFlags.None);
                bytes.Add(buffer);
            } while (_socket.Available > 0);
            string result = "";
            foreach (var item in bytes)
                result += Encoding.ASCII.GetString(item);
            return result;
        }
    }
}
