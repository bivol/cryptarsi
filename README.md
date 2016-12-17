CRYPTARSI - a browser based files encryption and search engine
Investigative journalists; human right activists and many other professionals need to protect data and to share protected data easily. Cryptarsi is a system designed to meet those needs without installing a specific software.

Cryptarsi is designed to work straight from the browser. If you read this on Chrome browser, then you can start using Cryptarsi right now. Otherwise install Chrome or Chromium and open this url again. Cryptarsi is loading from internet, but your data and passwords stay on your computer and never travel through internet. You can even disconnect your computer from internet now and continue using Cryptarsi.

With Cryptarsi you can easily encrypt a single file or a large collection of data: text, PDF, audio and video files and view them without leaving your browser. Text files are indexed and searchable. If you take some time to describe your data or if you have a big cache of text data with Cryptarsi it's very easy to search and locate the relevant documents and files.

Cryptarsi is an open source project available on Github. The development of the last version of Cryptarsi was supported by Google Digital News Initiative Fund.

The name Cryptarsi comes from the Latin word "Crypto" and the Bulgarian word "Tarsi", meaning "search".

If you want to contribute to the development of Cryptarsi join us on Github.

An early version of the system was used by the journalists from Bivol.bg while working on the Cablegate releases of Wikileaks from different locations.

File types support in Chrome: Text UTF-8 (.txt .html .xml); Images: jpg, png, gif; Audio: wav, ogg, mp3; Video: mp4, webm. Other files are downloadable and can be opened in external viewers. Text files are indexed and searchable.

Requirements: Chrome or Chromium browsers. The Firefox version is not fully operational.

Limitations: Because of a bug in CryptoJS a single file should not be bigger then 25 megabytes.

Fast start

The most simple usage of Cryptarsi is to encrypt files and to consult them or share them with other users. From the top of the sidebar click on the  add  button. Select a name for your data set, give it a description, type a strong password, click on "Add files", select individual files or a directory full of files from your disk and click again on the red button to import them.

Voilà, you have a new encrypted data set and his name will appear in the left menu.

To see the content of the newly created data set click on the name, type the password and type on the list button next to the search button.  list  to display the list of all the files. Click on a file name to open it in a new tab where you can view or download the file.

The encrypted data you just created is easy to export and share with other Cryptarsi users. To do this open the data set, unlock it with the password and click on the Export Data button  file_download

The export will produce a .tar archive containing encrypted data and indexes. You can send the tar file through email or if it is too big, share it in the cloud. Send the password to the persons allowed to use the archive by a separate and secured channel: encrypted chat or email. An even best practice is to split the password and to send the parts through different secured channels.

To import a Cryptarsi data set from file click on Import Data.  file_upload  Type a name for the data set, select the tar file and click the Import button.  file_upload

To give it a try without creating a new data set just download this file with a demo data set and import it. Select the newly imported data set from the list. The password for the demo data set is simply: test.

Go to the Search field and type "cryptarsi". As you can see you can do much more with Cryptarsi then simply encrypt files.

Beta 3 roadmap:
1. Load a tar archive from URL;
2. Circumvent the 25MB limit;
3. Optional key generation button;
4. Fix the Electron version to read from directories

Beta 5 roadmap:
1. Torrent server for the CrypTARsi files (electron version only) and torrent client (all versions);
2. Improved obfuscation of the index;
3. Imrpoved and faster encryption (electron native CryptoJS);
4. Incremental import and deletion;
5. Recover the tags system from V1;
6. Option to query the databases from a http server instead from indexedDB.
