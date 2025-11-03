import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    
    // Create window
    window = UIWindow(frame: UIScreen.main.bounds)
    
    // Show launch screen first
    let launchScreen = UIStoryboard(name: "LaunchScreen", bundle: nil)
    let launchVC = launchScreen.instantiateInitialViewController()
    window?.rootViewController = launchVC
    window?.makeKeyAndVisible()
    
    // Start React Native after 2 seconds
    DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
      factory.startReactNative(
        withModuleName: "PhotoPlayIOS",
        in: self.window,
        launchOptions: launchOptions
      )
    }
    
    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
