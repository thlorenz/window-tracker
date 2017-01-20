@import AppKit;

int main() {
  @autoreleasepool {

    NSArray* windows = CFBridgingRelease(CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID));

    for (NSDictionary* window in windows) {
      CGRect bounds;
      CGRectMakeWithDictionaryRepresentation((CFDictionaryRef)[window objectForKey:@"kCGWindowBounds"], &bounds);

      // skip transparent windows
      if ([window[(id)kCGWindowAlpha] intValue] == 0) {
        continue;
      }

      NSDictionary* winBounds = window[(id)kCGWindowBounds];
      int x = [winBounds[@"X"] intValue];
      int y = [winBounds[@"Y"] intValue];
      int w = [winBounds[@"Width"] intValue];
      int h = [winBounds[@"Height"] intValue];

      NSString* title = [window[(id)kCGWindowName]
        stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
      NSInteger winId = [window[(id)kCGWindowNumber] intValue];

      NSString* app = [window[(id)kCGWindowOwnerName]
        stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
      NSInteger pid = [window[(id)kCGWindowOwnerPID] intValue];

      printf("{ \"app\": \"%s\", \"appid\": %ld,"
               "\"window\": \"%s\", \"windowid\": %ld, "
               "\"bounds\": { \"x\": %d, \"y\": %d, \"w\": %d, \"h\": %d } "
              "}\n", app.UTF8String, pid, title.UTF8String, winId, x, y, w, h);

    }
    return 0;
  }
}
