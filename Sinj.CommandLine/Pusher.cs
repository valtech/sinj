using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Sinj.CommandLine
{
	class Pusher
	{
		private string _endpoint;
		private string[] _scripts;

		public Pusher(string endpoint, string[] scripts)
		{
			_endpoint = endpoint;
			_scripts = scripts;
		}

		public string Execute()
		{
			HttpWebRequest request = WebRequest.CreateHttp(_endpoint);

			PostScript(request);

			HttpWebResponse response = (HttpWebResponse)request.GetResponse();

			return ReadResponse(response);
		}

		private string BuildScript()
		{
			StringBuilder builder = new StringBuilder();

			foreach (string script in _scripts)
			{
				string contents = File.ReadAllText(script);

				builder.AppendFormat("{0}={1}&", "path", HttpUtility.UrlEncode(script));
				builder.AppendFormat("{0}={1}&", "script", HttpUtility.UrlEncode(contents));
			}

			return builder.ToString();
		}

		private void PostScript(HttpWebRequest request)
		{
			request.KeepAlive = false;
			request.Method = "POST";
			request.ContentType = "application/x-www-form-urlencoded";

			string script = BuildScript();

			byte[] requestData = Encoding.UTF8.GetBytes(script.ToString());

			request.ContentLength = requestData.Length;

			using (Stream requestStream = request.GetRequestStream())
			{
				requestStream.Write(requestData, 0, requestData.Length);
				requestStream.Close();
			}
		}

		private string ReadResponse(HttpWebResponse response)
		{
			string responseString = null;

			using (Stream responseStream = response.GetResponseStream())
			{
				StreamReader responseReader = new StreamReader(responseStream, Encoding.ASCII);

				responseString = responseReader.ReadToEnd();

				responseStream.Close();
			}

			return responseString;
		}
	}
}
