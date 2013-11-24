using Microsoft.ClearScript;
using Sitecore.SecurityModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Sinj
{
	public class PushContext
	{
		private string _database = "master";
		private DateTime _start = DateTime.Now;

		[ScriptMember(Name = "db")]
		public Sitecore.Data.Database Database
		{
			get
			{
				return Sitecore.Configuration.Factory.GetDatabase(_database);
			}
		}

		[ScriptMember(Name = "use")]
		public void Use(string database)
		{
			_database = database;
		}

		[ScriptMember(Name = "id")]
		public string Id()
		{
			return Guid.NewGuid().ToString();
		}

		[ScriptMember(Name = "log")]
		public void Log(string message)
		{
			HttpContext context = HttpContext.Current;

			HttpResponse response = context.Response;

			TimeSpan duration = DateTime.Now - _start;

			response.Write(String.Format("{1:D4} - {0}\r\n", message, (int)duration.TotalSeconds));

			response.Flush();
		}
	}
}
