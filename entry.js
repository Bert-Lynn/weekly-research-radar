// Keep existing issue and paper bookmarks working after the new cover entry.
const entryParams=new URLSearchParams(location.search);
const entryHash=location.hash;
if(entryHash==="#archive"||entryHash==="#actions")location.replace("reports.html#archive");
else if(entryParams.has("week")||entryParams.get("view")==="guides"||/^#(?:paper-\d+|papers|must|reserve|horizon)$/.test(entryHash))location.replace("papers.html"+location.search+entryHash);
