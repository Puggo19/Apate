# Apate is deprecated
While it was a fun project that really introduced me into the world of BetterDiscord plugins, I will no longer maintain Apate and take it down from the BD website. This is mostly due to the fact that this plugin is used primarily for malicious purposes and/or being disrespectful. Just because you have a plugin that uses some steganography and cryptography, doesn't make it ok for you to be toxic to other people that can't see your messages and open up servers that are against Discord ToS. If you really need a plugin that encrypts your messages, I'm sure you'll be able to find one with a quick google search. I do not want to be associated and/or responsible for the problematic use cases Apate _can_ induce. It was never my intention for this plugin to turn out the way it is seemingly used now. It's also a lot of work to maintain such a big plugin. 

Thank you for understanding. 


<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate" width="200" align="center">
</h1>
 <h4 align="center">Hide your secret Discord messages in other messages!</h4>

<a href="https://github.com/KuroLabs/stegcloak" style="position: absolute; top: 100px; right: 20px; padding: 0 0 20px 20px;"><img src="https://raw.githubusercontent.com/KuroLabs/stegcloak/master/assets/stegCloakIcon.svg" alt="JavaScript Standard Style" width="80" align="right"></a>

Apate is a tool based on [StegCloak](https://github.com/KuroLabs/stegcloak) that allows you to send and read invisible hidden messages through [BetterDiscord](https://betterdiscord.app/). It hides the message using zero width unicode characters and an indicator character at the start of the string. It then goes through all the messages in chat and tries to insert a new `div` with the hidden message.




## Installing
Make sure you have [BetterDiscord](https://betterdiscord.app/) installed. Then just download the Plugin [here](https://betterdiscord.app/Download?id=446) and pull it into your plugins Folder. If you are asked to download the ZeresPluginLibrary, download it. If you see a `There is an update for Apate available!` Banner message, click it to fully update Apate. 

## Usage
<img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/Tutorials/sendMessage.gif" alt="Demo" width="500">
</br>

Syntax:
>Cover text \*hidden message*

For a more detailed explanation, click [here](https://github.com/TheGreenPig/Apate/blob/main/Assets/Tutorials/README.md).

## End to End Encryption
For a detailed description on how to use e2e encryption in your messages, click [here](https://github.com/TheGreenPig/Apate/blob/main/Assets/Tutorials/README.md#end-to-end-encryption).

## Passwords
In Apate you can set your own password and then only people that have your password in their list can read your messages. 

**To set your password:** 

Go into `Settings > Plugins > Apate Settings (Cogwheel) > Encryption` and enter the password you want into the Textbox. This will be your default password and all your messages will be encrypted with it, as long as you have Encrpytion on. If you don't want to generate a password yourself, you can hit the `Generate Password` Button. It will create a password out of three english words and then random symbols to make the password both secure and easy to identify.

**To  manage your password list:** 

Go into `Settings > Plugins > Apate Settings (Cogwheel) > Passwords`. 
<br>If you want to add a password, enter it into the Textbox and press `Add Password`. The password should appear in the list below and then Apate should decrypt all messages with that specific password automatically. To remove a password, press the ❌ Symbol.

**Import / Export Password list:**

In case you want to save your password list to make sure you don't lose it you can press the `Download Password list` button. It will promt you to save your list as a `.txt` file. If you then want to import that password list, simply press `Import Password list` and select your file. Notice **ALL YOUR PASSWORDS WILL BE LOST** when you import a new list. Save your password list before importing a new one, just to be sure you dont loose anything. 
Note:
- Your personal password is always automatically in your list (if you used it at least once).
- The more passwords you have in your list, the longer the decryption prosses will take.
- The higher up a password is, the more priority it has (passwords you use often will automatically move up the list).

## Quickly changing between passwords 
By default, the message will be sent with your chosen password (if encrpytion is turned on). If you want to send a message with a different (or no) password once, you can right-click the key on the bottom right to select a password. This will **NOT** change your default password.

## Authors

<img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate Logo" width="80" align="right"></img>
><a href="https://github.com/TheGreenPig"><img src="https://github.com/thegreenpig.png?size=60"><p>TheGreenPig</p></a>
><a href="https://github.com/fabJunior"><img src="https://github.com/fabJunior.png?size=60" width="60"><p>fabJunior</p></a>
><a href="https://github.com/BenjaminAster"><img src="https://github.com/BenjaminAster.png?size=60"><p>BenjaminAster</p></a>

## Contributors
><img src="https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg" alt="Apate Logo" width="80" align="right"></img>
><a href="https://github.com/gurrrrrrett3"><img width="60" height="60" src="https://github.com/gurrrrrrett3.png?size=60"><p>gurrrrrrett3</p></a>

## Services used and people to thank:

 - **StegCloak** 

   This does all the hiding. Apate could not work without it! 
	 >[Github link](https://github.com/KuroLabs/stegcloak)
   
 - **Cryptico** 
 
   Is used for the End to End (asymmetric) Encryption! 
	 >[Github link](https://github.com/wwwtyro/cryptico)
   
 - **Better Discord** 
 
	 Without it, I couldn't even make plugins for Discord at all, so huge thanks! 
	 >[Website](https://betterdiscord.app/)
   
  - **Zere's Plugin Library** 
  
  	An incredibly useful library used a lot in the plugin. Thanks Zerebos!
	   >[Documentation](https://rauenzi.github.io/BDPluginLibrary/docs/)
   
  -  **images.weserv.nl** 
  
	  Is used a cool free proxy for all images to prevent people from using malicious links to grab IP addresses.
	   >[Website](https://images.weserv.nl/)
   
 -  **All the helpful people of the BD community** 
 
	 Thank you for showing me helpful tips and getting me into the world of BetterDiscord plugin
   programming. 
	   >[Discord Server](https://betterdiscord.app/invite)

