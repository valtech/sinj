var scInsertMediaItem = function (packet) {
    scInsertItem(packet);

    // Set the media
    var item = scItem(packet.id,null,null);
    $scMediaItem.attachMedia(item, packet.fileName, packet.media64);
}