using System.IO;
using Microsoft.ClearScript;
using Sitecore.Data.Items;
using Sitecore.IO;
using Sitecore.Resources.Media;

namespace Sinj
{
    public class MediaItem
    {
        [ScriptMember(Name = "attachMedia")]
        public Item AttachMedia(Item item, string fileName, string encodedMedia)
        {
            using (var memoryStream = new MemoryStream())
            {
                var decoded = System.Convert.FromBase64String(encodedMedia);
                memoryStream.Write(decoded, 0, decoded.Length);

                Media media = MediaManager.GetMedia(item);
                media.SetStream(memoryStream, FileUtil.GetExtension(fileName));

                return media.MediaData.MediaItem;
            }
        }
    }
}