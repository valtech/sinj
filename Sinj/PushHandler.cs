using System;
using System.Reflection;
using Microsoft.ClearScript;
using Microsoft.ClearScript.Windows;
using System.Web;
using System.Configuration;

namespace Sinj
{
	public class PushHandler : IHttpHandler
	{
		public bool IsReusable
		{
			get
			{
				return true;
			}
		}

		public void ProcessRequest(HttpContext context)
		{
			DateTime start = DateTime.Now;

			string[] paths = context.Request.Params.GetValues("path");
			string[] scripts = context.Request.Params.GetValues("script");

			int pathIndex = -1;

			context.Response.ContentType = "text/plain";
			context.Response.Write("Connected to SINJ handler on " + Environment.MachineName + "\r\n");
			context.Response.Write("Sinj Version " + Assembly.GetExecutingAssembly().GetName().Version + "\r\n");

			context.Response.Write("Num Paths = " + GetDebugString(paths) + "\r\n");
			context.Response.Write("Num Scripts = " + GetDebugString(scripts) + "\r\n");

			WindowsScriptEngineFlags flags = WindowsScriptEngineFlags.None;

			if (context.Request.Params["debug"] == "true")
			{
				flags = WindowsScriptEngineFlags.EnableDebugging;
			}

			using (ScriptEngine engine = new JScriptEngine(flags))
			{
                engine.AddHostObject("$sc", new PushContext());
				engine.AddHostType("$scItemManager", typeof(Sitecore.Data.Managers.ItemManager));
				engine.AddHostType("$scTemplateManager", typeof(Sitecore.Data.Managers.TemplateManager));
				engine.AddHostType("$scLanguage", typeof(Sitecore.Globalization.Language));
				engine.AddHostType("$scVersion", typeof(Sitecore.Data.Version));
				engine.AddHostType("$scID", typeof(Sitecore.Data.ID));
				engine.AddHostType("$scTemplateIDs", typeof(Sitecore.TemplateIDs));
				engine.AddHostType("$scTemplateFieldIDs", typeof(Sitecore.TemplateFieldIDs));
				engine.AddHostType("$scTemplateFieldSharing", typeof(Sitecore.Data.Templates.TemplateFieldSharing));
                engine.AddHostObject("$scMediaItem", new MediaItem());
                engine.AddHostType("$scFieldIDs", typeof(Sitecore.FieldIDs));

				if (scripts != null && paths != null)
				{
					try
					{
						using (new Sitecore.Security.Accounts.UserSwitcher(Sitecore.Security.Accounts.User.FromName(RunAsUser, true)))
						{
							using (new Sitecore.SecurityModel.SecurityDisabler())
							{
								foreach (string script in scripts)
								{
									pathIndex++;

									engine.Execute(script);
								}
							}
						}

						TimeSpan duration = DateTime.Now - start;

						context.Response.Write(String.Format("Sinj.PushHandler Completed Successfully in {0} seconds.", duration.TotalSeconds));
					}
					catch (ScriptEngineException e)
					{
						context.Response.Write("PushHandler error in script file' " + paths[pathIndex] + "'. ");
						context.Response.Write(e.ErrorDetails + "\r\n\r\n" + e.InnerException + "\r\n\r\n");
					}
				}
				else
				{
					engine.Execute("$sc.log('Hello from Sinj...')");
				}
			}
		}
		
		private static string GetDebugString(string[] array)
		{
			return array == null ? "null" : array.Length.ToString();
		}


		private string RunAsUser
		{
			get
			{
				var configValue = ConfigurationManager.AppSettings["Sinj.RunAsUser"];

				if (string.IsNullOrWhiteSpace(configValue))
				{
					return "sitecore\\admin";
				}

				return configValue;
			}
		}
	}
}
