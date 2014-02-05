using System;
using System.Reflection;

namespace Sinj.CommandLine
{
	class Program
	{
		static int Main(string[] args)
		{
			Console.WriteLine("Sinj.CommandLine Version " + Assembly.GetExecutingAssembly().GetName().Version);

			CommandLineEngine engine = new CommandLineEngine(args);
			int returnValue = engine.TryExecute();

			Console.WriteLine("Sinj.CommandLine Completed " + (returnValue == 0 ? "Successfully" : "Failed (ErrorCode=" + returnValue + ")"));
			return returnValue;
		}
	}
}
