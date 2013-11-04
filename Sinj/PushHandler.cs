using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.ClearScript;
using Microsoft.ClearScript.Windows;
using System.IO;
using System.Web;

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

			using (ScriptEngine engine = new JScriptEngine(WindowsScriptEngineFlags.EnableDebugging))
			{
				engine.AddHostObject("$sc", new PushContext());
				engine.AddHostType("$scItemManager", typeof(Sitecore.Data.Managers.ItemManager));
				engine.AddHostType("$scLanguage", typeof(Sitecore.Globalization.Language));
				engine.AddHostType("$scVersion", typeof(Sitecore.Data.Version));
				engine.AddHostType("$scID", typeof(Sitecore.Data.ID));
				engine.AddHostType("$scTemplateIDs", typeof(Sitecore.TemplateIDs));
				engine.AddHostType("$scTemplateFieldIDs", typeof(Sitecore.TemplateFieldIDs));
				
				try
				{
					using (new Sitecore.SecurityModel.SecurityDisabler())
					{
						foreach (string script in scripts)
						{
							pathIndex++;

							engine.Execute(script);
						}
					}

					TimeSpan duration = DateTime.Now - start;

					context.Response.Write(String.Format("Completed in {0} seconds.", duration.TotalSeconds));
				}
				catch (ScriptEngineException e)
				{
					context.Response.Write("Error in script file' " + paths[pathIndex] + "'. ");
					context.Response.Write(e.ErrorDetails + "\r\n\r\n" + e.InnerException + "\r\n\r\n");
				}
			}
		}
	}
}
