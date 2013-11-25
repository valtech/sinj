using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.ClearScript;
using Microsoft.ClearScript.Windows;

namespace Sinj.CommandLine
{
	internal class CommandLineEngine
	{
		private readonly List<string> _paths = new List<string>();
		private bool _debug;
		private static WindowsScriptEngineFlags _scriptFlags = WindowsScriptEngineFlags.None;

		public CommandLineEngine(IEnumerable<string> args)
		{
			foreach (string arg in args)
			{
				ProcessArg(arg);
			}

			InitialiseScriptFlags();
		}

		private void ProcessArg(string arg)
		{
			if (String.Equals(arg, "-debug", StringComparison.OrdinalIgnoreCase))
			{
				_debug = true;
			}
			else
			{
				_paths.Add(arg);
			}
		}

		private void InitialiseScriptFlags()
		{
			if (_debug)
			{
				_scriptFlags = WindowsScriptEngineFlags.EnableDebugging;
			}
		}

		public int TryExecute()
		{
			try
			{
				return Execute();
			}
			catch (Exception ex)
			{
				Console.Write("Error " + ex);
				return 1;
			}
		}

		private int Execute()
		{
			int returnValue = 0;
			using (ScriptEngine scriptEngine = new JScriptEngine(_scriptFlags))
			{
				scriptEngine.AddHostObject("$cmd", new ProgramContext(_debug));

				foreach (string path in _paths)
				{
					try
					{
						Console.Write("scriptEngine.Execute: " + path + "\r\n");
						string contents = File.ReadAllText(path);
						scriptEngine.Execute(contents);
					}
					catch (ScriptEngineException e)
					{
						Console.Write("CommandLineEngine error with script file' " + path + "'. ");
						Console.Write(e.ErrorDetails + "\r\n\r\n" + e.InnerException + "\r\n\r\n");

						returnValue = 2;
						break;
					}
					catch (Exception ex)
					{
						Console.Write("CommandLineEngine error with script file' " + path + "'. ");
						Console.Write("Details: " + GetaAllMessages(ex));

						returnValue = 3;
						break;
					}
				}
			}

			return returnValue;
		}

		private static string GetaAllMessages(Exception ex)
		{
			string message = string.Empty;
			Exception innerException = ex;

			do
			{
				message = message + (string.IsNullOrEmpty(innerException.Message) ? string.Empty : innerException.Message);
				innerException = innerException.InnerException;
			}
			while (innerException != null);

			return message;
		}
	}
}