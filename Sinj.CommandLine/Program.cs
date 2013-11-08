using Microsoft.ClearScript;
using Microsoft.ClearScript.Windows;
//using Microsoft.ClearScript.V8;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sinj.CommandLine
{
	class Program
	{
		static void Main(string[] args)
		{
			List<string> paths = new List<string>();

			bool debug = false;

			foreach (string arg in args)
			{
				if (String.Equals(arg, "-debug", StringComparison.OrdinalIgnoreCase))
				{
					debug = true;
				}
				else
				{
					paths.Add(arg);
				}
			}

			WindowsScriptEngineFlags flags = WindowsScriptEngineFlags.None;

			if (debug)
			{
				flags = WindowsScriptEngineFlags.EnableDebugging;
			}

            //new V8ScriptEngine(V8ScriptEngineFlags.EnableDebugging)
			using (ScriptEngine engine = new JScriptEngine(flags))
			{
				engine.AddHostObject("$cmd", new ProgramContext(debug));

				int pathIndex = -1;

				try
				{
					foreach (string path in paths)
					{
						pathIndex++;

						string contents = File.ReadAllText(paths[pathIndex]);

						engine.Execute(contents);
					}
				}
				catch (ScriptEngineException e)
				{
					Console.Write("Error in script file' " + paths[pathIndex] + "'. ");
					Console.Write(e.ErrorDetails + "\r\n\r\n" + e.InnerException + "\r\n\r\n");
				}
			}
		}
	}
}
