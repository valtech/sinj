using Microsoft.ClearScript;
using Sitecore.Security.Accounts;
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
		private string _database;
		private DateTime _start = DateTime.Now;

		public PushContext(string defaultDatabaseName = "master")
		{
			_database = defaultDatabaseName;
		}

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

		[ScriptMember(Name = "runAsUser")]
		public void RunAsUser(string username)
		{
			if (UserSwitcher.CurrentValue != null)
			{
				Log(string.Format("Finished running as '{0}'", UserSwitcher.CurrentValue.Name));
				UserSwitcher.Exit();
			}

			if (string.IsNullOrWhiteSpace(username))
			{
				return;
			}

			Log(string.Format("Running as '{0}'", username));
			UserSwitcher.Enter(User.FromName(username, true));
		}

		[ScriptMember(Name = "hasUserContext")]
		public bool HasUserContext
		{
			get
			{
				return UserSwitcher.CurrentValue != null;
			}
		}
	}
}
