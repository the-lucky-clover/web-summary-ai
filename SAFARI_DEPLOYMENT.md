# 🍎 Safari Deployment Guide - Web Summary AI

Complete guide for deploying and testing the Web Summary AI extension on macOS Safari and iOS Safari.

---

## 📋 Prerequisites

### Required Tools

- **macOS** 12.0 (Monterey) or later
- **Xcode** 14.0 or later (free from App Store)
- **Safari** 15.4 or later
- **Apple Developer Account** (free tier is sufficient for local testing)
- **iOS Device** (optional, for iOS Safari testing)

### Install Xcode

```bash
# Option 1: From App Store
# Search "Xcode" in App Store and install

# Option 2: Command Line Tools only (smaller download)
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
```

---

## 🚀 Part 1: Convert Chrome Extension to Safari Extension

Safari requires a special wrapper app to run Web Extensions. Follow these steps:

### Step 1: Create Safari Extension Project

```bash
# Navigate to project directory
cd /Users/pounds_1/Development/web-summary-ai

# Create Safari extension using xcrun
xcrun safari-web-extension-converter . \
  --app-name "Web Summary AI" \
  --bundle-identifier "com.websummary.safari" \
  --macos-only

# This creates a new Xcode project with your extension bundled
```

### Alternative: With iOS Support

```bash
xcrun safari-web-extension-converter . \
  --app-name "Web Summary AI" \
  --bundle-identifier "com.websummary.safari" \
  --ios-only  # For iOS only
  
# OR for both platforms:
xcrun safari-web-extension-converter . \
  --app-name "Web Summary AI" \
  --bundle-identifier "com.websummary.safari"
```

### Step 2: Review Generated Files

The converter creates:

```text
Web Summary AI/
├── Web Summary AI (macOS)/
│   ├── Web Summary AI.app
│   ├── Resources/
│   │   └── manifest.json         # Your extension
│   └── ViewController.swift
├── Web Summary AI (iOS)/          # If iOS support enabled
├── Web Summary AI Extension/
│   └── Resources/                 # Shared extension code
└── Web Summary AI.xcodeproj       # Xcode project
```

### Step 3: Update manifest.json for Safari

Safari requires some manifest adjustments. Update your `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Web Summary AI",
  "version": "1.0.0",
  "description": "AI-powered web and video summarization",
  
  "browser_specific_settings": {
    "safari": {
      "strict_min_version": "15.4"
    }
  },
  
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  
  "host_permissions": [
    "*://*/*"
  ],
  
  "background": {
    "service_worker": "src/background.js",
    "type": "module"
  },
  
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content.js"],
      "run_at": "document_idle"
    }
  ],
  
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

---

## 🔨 Part 2: Build and Run on macOS Safari

### Method 1: Using Xcode (Recommended)

1. **Open the Project**
   ```bash
   cd "Web Summary AI"
   open "Web Summary AI.xcodeproj"
   ```

2. **Configure Signing**
   - Select the project in Xcode's left sidebar
   - Go to "Signing & Capabilities" tab
   - Select your Apple ID under "Team"
   - Xcode will automatically create a provisioning profile

3. **Select Target**
   - Choose "Web Summary AI (macOS)" from the scheme selector
   - Select "My Mac" as the destination

4. **Build and Run**
   - Press `Cmd + R` or click the Play button
   - The app will launch automatically
   - Safari will prompt to enable the extension

5. **Enable Extension in Safari**
   - Open Safari → Preferences (Cmd + ,)
   - Go to "Extensions" tab
   - Check "Web Summary AI"
   - Click "Always Allow on Every Website" (or configure per-site)

### Method 2: Build from Terminal

```bash
# Build the app
xcodebuild -project "Web Summary AI.xcodeproj" \
  -scheme "Web Summary AI (macOS)" \
  -configuration Debug \
  build

# Run the app
   open "build/Debug/Web Summary AI.app"
```

### Method 3: Direct Safari Extension Loading (Developer Mode)

```bash
```

### Method 3: Direct Safari Extension Loading (Developer Mode)

```bash
# Enable Safari Developer menu
defaults write com.apple.Safari IncludeDevelopMenu -bool true

# Then in Safari:
# 1. Develop → Allow Unsigned Extensions
# 2. Develop → Show Extension Builder
# 3. Click "+" and add your extension folder
```

---

## 📱 Part 3: Test on iOS Safari

### Prerequisites for iOS Testing

1. **Physical iOS Device** (iOS 15.4+)
   - Simulators don't fully support Safari extensions
   - Must be connected via USB or WiFi

2. **Enable Developer Mode on iPhone/iPad**
   ```
   Settings → Privacy & Security → Developer Mode → ON
   (Requires restart)
   ```

3. **Trust Your Mac**
   - Connect device to Mac
   - Trust this computer when prompted

### Deploy to iOS Device

1. **Open Xcode Project**

   ```bash
   open "Web Summary AI/Web Summary AI.xcodeproj"
   ```

2. **Select iOS Target**
   - Choose "Web Summary AI (iOS)" from scheme selector
   - Select your connected iOS device as destination

3. **Configure App Signing**
   - Select project → "Web Summary AI (iOS)" target
   - Signing & Capabilities tab
   - Select your Apple ID under Team
   - Change Bundle Identifier if needed: `com.yourname.websummary`

4. **Build and Run**
   - Press `Cmd + R`
   - App installs and launches on your device
   - Accept any security prompts

5. **Enable Extension on iOS**
   ```
   iOS Settings → Safari → Extensions → Web Summary AI → ON
   Toggle "All Websites" or configure per-site permissions
   ```

6. **Test the Extension**
   - Open Safari on iOS
   - Navigate to any webpage
   - Tap the "aA" button in address bar
   - Select "Web Summary AI"

---

## 🧪 Part 4: Testing & Debugging

### Debug macOS Safari Extension

1. **Safari Developer Console**

   ```text
   Safari → Develop → [Your Mac Name] → Web Summary AI
   
   Choose:
   - Extension Background Page (for background.js)
   - Popup (for popup.html)
   - Content Script (for content.js on active tab)
   ```

2. **View Logs**

   ```bash
   # Service Worker logs
   log show --predicate 'subsystem == "com.apple.Safari"' --last 1h
   
   # Extension logs
   log stream --predicate 'process == "Safari"' --level debug
   ```

3. **Check Console**
   - Open Extension Builder: Safari → Develop → Show Extension Builder
   - Select your extension
   - View errors, warnings, and console output

### Debug iOS Safari Extension

1. **Connect Device to Mac**

   ```text
   # Enable Web Inspector on iOS
   Settings → Safari → Advanced → Web Inspector → ON
   ```

2. **Use Safari Developer Tools**

   ```text
   Mac Safari → Develop → [Your iPhone/iPad Name] → Web Summary AI
   ```

3. **Real Device Logging**

   ```bash
   # View iOS device logs
   idevicesyslog | grep "Web Summary AI"
   
   # Or use Console.app
   # Open Console.app → Select your device → Filter by "Safari"
   ```

### Common Issues & Solutions

#### Issue: "Cannot verify developer"

**Solution:**

```bash
# On Mac: System Preferences → Security & Privacy → General
# Click "Open Anyway" for the blocked app

# On iOS: Settings → General → VPN & Device Management
# Trust your developer certificate
```

#### Issue: Extension not loading

**Solution:**

1. Rebuild the app in Xcode
2. Delete and reinstall on device
3. Check Safari → Preferences → Extensions → Enable extension
4. Clear Safari cache and restart

#### Issue: Content scripts not injecting
**Solution:**
1. Check host_permissions in manifest.json
2. Verify content_scripts matches pattern
3. Check Safari → Develop → [Device] → Show Web Inspector
4. Look for CSP violations in console

#### Issue: API not working (chrome.*)

**Solution:**

Safari uses `browser.*` namespace. Add compatibility:

```javascript
// At top of your JS files
const browser = window.browser || window.chrome;
```

---

## 📦 Part 5: Distribution Preparation

### For Personal Use (Free)

1. **Export Archive**
   ```
   Xcode → Product → Archive
   Window → Organizer → Archives
   Distribute App → Development → Export
   ```

2. **Share with Other Macs**
   - Recipients must have macOS 12+
   - Right-click app → Get Info → check "Open Anyway"
   - Install and enable in Safari

### For App Store Distribution (Requires Paid Developer Account)

1. **Create App Store Connect Record**
   - Visit https://appstoreconnect.apple.com
   - Create new app with bundle ID: `com.websummary.safari`
   - Fill in metadata and screenshots

2. **Configure App Store Signing**
   ```
   Xcode → Signing & Capabilities
   Automatically manage signing: ON
   Team: [Your Paid Developer Account]
   ```

3. **Archive and Upload**
   ```
   Xcode → Product → Archive
   Organizer → Distribute App → App Store Connect
   Upload → Submit for Review
   ```

4. **iOS App Store Requirements**
   - Screenshots for all iPhone/iPad sizes
   - Privacy policy URL
   - App description and keywords
   - Age rating information
   - Promotional text

---

## 🔐 Part 6: Permissions & Security

### Required Entitlements

Add to `Web Summary AI.entitlements`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
</dict>
</plist>
```

### Privacy Manifest (Required for App Store)

Create `PrivacyInfo.xcprivacy`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

---

## 🎯 Quick Testing Checklist

### macOS Safari
- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Content script injects on test pages
- [ ] Background service worker runs
- [ ] Storage API works (settings persist)
- [ ] Icon appears in Safari toolbar
- [ ] Context menus work (if implemented)
- [ ] YouTube extraction works

### iOS Safari  
- [ ] Extension appears in Safari settings
- [ ] Can be enabled/disabled per website
- [ ] Popup opens on tap (if applicable)
- [ ] Content scripts work on mobile pages
- [ ] Touch interactions work correctly
- [ ] Responsive design looks good
- [ ] Works in both portrait/landscape
- [ ] Permissions requested correctly

---

## 📚 Additional Resources

### Apple Documentation

- [Safari Web Extensions](<https://developer.apple.com/documentation/safariservices/safari_web_extensions>)
- [Converting Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Useful Commands
```bash
# Check Safari version
/Applications/Safari.app/Contents/MacOS/Safari --version

# List connected iOS devices  
instruments -s devices

# Clean Xcode build
xcodebuild clean -project "Web Summary AI.xcodeproj"

# View extension files
find ~/Library/Safari/Extensions -name "*.appex"
```

### Community Support

- Apple Developer Forums: <https://developer.apple.com/forums/>
- Safari Extensions: <https://developer.apple.com/safari/extensions/>
- Stack Overflow: Tag `safari-extension` or `safari-app-extension`

---

## 🎉 You're Ready

Your Web Summary AI extension is now ready to:

- ✅ Run locally on macOS Safari
- ✅ Test on iOS devices  
- ✅ Debug with Safari Web Inspector
- ✅ Submit to App Store (optional)

**Happy Testing!** 🚀
