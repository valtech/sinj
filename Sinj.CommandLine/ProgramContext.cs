using Microsoft.ClearScript;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sinj.CommandLine
{
	public class ProgramContext
	{
		private bool _debug;

		public ProgramContext(bool debug)
		{
			_debug = debug;
		}

		[ScriptMember(Name = "push")]
		public void Push(string endpoint, dynamic scripts)
		{
			Pusher executer = new Pusher(endpoint, EnumerateScripts(scripts).ToArray(), _debug);

			executer.Execute();
		}

		private static IEnumerable<string> EnumerateScripts(dynamic scripts)
		{
			IList<string> list = new List<string>();

			for (int i = 0; i < scripts.length; i++)
			{
				string value = scripts[i].ToString();

				list.Add(value);
			}

			return list;
		}

		[ScriptMember(Name = "log")]
		public void Log(string message)
		{
			Console.WriteLine(message);
		}

		[ScriptMember(Name = "cwd")]
		public string CurrentWorkingDirectory
		{
			get
			{
				return Environment.CurrentDirectory;
			}
		}

		[ScriptMember(Name = "pc")]
		public string MachineName
		{
			get
			{
				return Environment.MachineName.ToLowerInvariant();
			}
		}
	}
}
