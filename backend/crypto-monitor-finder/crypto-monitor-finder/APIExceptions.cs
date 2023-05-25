namespace crypto_monitor_finder
{
    public class APIExceptions : Exception
    {
        public int Code { get; set; } = 0;
        public string IP { get; set; }
        public string MAC { get; set; }

        public APIExceptions() : base() { }
        public APIExceptions(string message) : base(message) { }

        public static APIExceptions UnknownException(string command, int code, string message, string ip, string mac)
            => new APIExceptions($"Unknown exception '{command}' command.\nCode:{code} Msg:{message}") { Code = 1, IP = ip, MAC = mac };

        public static APIExceptions AccessDenied(string command, string ip, string mac)
            => new APIExceptions($"Access denide to '{command}' command") { Code = 2, IP = ip, MAC = mac };

        public static APIExceptions NullResponse(string ip, string mac)
            => new APIExceptions("Null response") { Code = 3, IP = ip, MAC = mac };

        public static APIExceptions NoStatusValue(string ip, string mac)
            => new APIExceptions("Have not status value") { Code = 4, IP = ip, MAC = mac };

        public static APIExceptions NoBody(string ip, string mac)
            => new APIExceptions("Have not body") { Code = 5, IP = ip, MAC = mac };
    }
}
