using Microsoft.ClearScript;
using System;
using System.Collections.Generic;

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
		public int Push(string endpoint, dynamic scripts)
		{
			try
			{
				Pusher executer = new Pusher(endpoint, EnumerateScripts(scripts).ToArray(), _debug);

				return executer.Execute();
			}
			catch (Exception ex)
			{
				Console.Write(ex.Message + "\r\n");

				return 1;
			}
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
