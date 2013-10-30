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

		[ScriptMember(Name = "log")]
		public void Log(string message)
		{
			HttpContext context = HttpContext.Current;

			HttpResponse response = context.Response;

			response.Write(message + "\r\n");
		}
	}
}
