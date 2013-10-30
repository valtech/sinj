﻿using Microsoft.ClearScript;
using Microsoft.ClearScript.Windows;
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
			string[] paths = args;

			using (ScriptEngine engine = new JScriptEngine(WindowsScriptEngineFlags.EnableDebugging))
			{
				engine.AddHostObject("$cmd", new ProgramContext());

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