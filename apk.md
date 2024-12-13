I’ll start by stressing that modifying an APK without the original developer’s permission can violate software licenses, terms of service, or even local laws. If you don’t have explicit permission (or legal right) to alter the app, you should reconsider. If you do have permission or own the rights to the app, here is the high-level process.

1. Understand the Basics

When you say you want to “change the password” in an APK, there are a few possible scenarios:
	1.	Hard-Coded Password: The app may contain a hard-coded password in a config file or string resource.
	2.	Auth Logic in Java/Kotlin Bytecode: The password check might be in the compiled Java/Kotlin code, so you’d need to patch that logic.
	3.	Native Libraries: In some cases, the password check might live in native C/C++ libraries ( .so files ), requiring more advanced disassembly or patching.

For typical Android apps, you’ll often deal with Scenario #1 or Scenario #2.

2. Tooling for Reverse Engineering

To locate and modify a password inside an APK, you’ll need a few tools:
	1.	APK decompiler tools:
	•	Apktool: Decompile and recompile the APK’s smali code (the low-level bytecode for Dalvik/ART).
	•	Jadx: Decompile the APK into Java-like source code for easier reading (though not always perfectly reconstructable).
	2.	Text or code editor to modify extracted files.
	3.	Java keytool & jarsigner or apksigner (from Android SDK) to re-sign the recompiled APK. Because once you modify the APK contents, the original digital signature will be invalid.

3. Step-by-Step Guide (High-Level)

Below is a generalized process. The specifics can vary significantly depending on how the password is stored or checked.

3.1 Decompile the APK

Using Apktool (example commands might vary depending on platform and setup):

apktool d MyApp.apk -o MyApp_decompiled

	•	This creates a folder named MyApp_decompiled containing the smali code, resources, and manifest.

Using Jadx (optional):

jadx-gui MyApp.apk

	•	Jadx gives you a Java-like representation. You can search for strings that look like "Save RTSP" in the code to see where and how it’s used.

3.2 Locate the Password Check
	1.	Search for Hard-Coded Strings:
	•	Sometimes the password is in res/values/strings.xml or in smali code as a string constant.
	•	Use a text search (e.g., grep, Notepad++, etc.) to look for Save RTSP inside the MyApp_decompiled directory.
	2.	Check Smali Code:
	•	If it’s a direct string, it might appear in a .smali file. For example, lines like:

const-string v0, "Save RTSP"


	•	If you find that exact code, you can change the string to your desired password (e.g., const-string v0, "NewPassword").

	3.	Examine the Authentication Logic:
	•	Sometimes it’s not just a string resource but a function call that compares a user input with "Save RTSP". If so, you might find code like:

const-string v0, "Save RTSP"
invoke-virtual {v1, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z


	•	You can either change "Save RTSP" to your new string or alter the code logic (so that the check is always true, for instance).

3.3 Modify the Password and Rebuild

After editing the smali or resource files to your desired password:
	1.	Rebuild the APK:

apktool b MyApp_decompiled -o MyApp_modified.apk


	2.	Sign the Modified APK:
	•	Android requires all APKs to be digitally signed. You can use jarsigner or the Android SDK’s apksigner.

# Using apksigner from the Android SDK build tools:
apksigner sign --ks my-release-key.jks --out MyApp_signed.apk MyApp_modified.apk


	•	Alternatively:

jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.jks MyApp_modified.apk alias_name


	•	Then align (optional but recommended) with zipalign:

zipalign -v 4 MyApp_modified.apk MyApp_aligned.apk



3.4 Test the Modified APK
	•	Uninstall the old version of the app from your device (otherwise the signature mismatch might block you).
	•	Install your MyApp_signed.apk (or MyApp_aligned.apk) on the device.
	•	Launch and check if the new password logic works as expected.

4. Potential Complications
	1.	Obfuscation: If the code is heavily obfuscated, the search for "Save RTSP" might be more challenging.
	2.	Native Libraries: If the auth check is in native code (.so files), you’d need disassembly tools (like Ghidra or IDA Pro) to patch the binary. This is more advanced and not as straightforward as editing smali.
	3.	Integrity Checks: Some apps have built-in tamper detection. The app might refuse to run if any bytecode is changed. Bypassing that can involve patching the integrity checks as well.
	4.	Legal/Ethical Concerns: Always ensure you have authorization to modify the APK.

Summary

Yes, it’s typically possible to change or patch a password prompt in an APK without source code—assuming:
	•	The password is indeed stored in a decompilable portion of the code (most are).
	•	The logic isn’t hidden behind elaborate obfuscation or native checks.
	•	You have the legal right or explicit permission to do so.

How to do it (at a high level):
	1.	Decompile with Apktool or Jadx.
	2.	Search the code for the string ("Save RTSP") or the relevant password-check function.
	3.	Modify the string or logic.
	4.	Rebuild and sign the APK.

After that, install and test. If the password logic is more complex or stored in a native library, the process gets harder and may require advanced reversing skills.

Important: If you are not the owner or do not have explicit permission, modifying or redistributing an APK can break licensing terms or local laws. Always proceed with caution and consult legal advice if unsure.