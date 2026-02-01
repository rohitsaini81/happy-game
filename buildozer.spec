[app]
title = Happy Game
package.name = happygame
package.domain = org.happygame

source.dir = .
source.include_exts = py,kv,png,jpg

version = 0.1

requirements = python3,kivy

orientation = portrait
fullscreen = 0

android.api = 31
android.minapi = 24
android.permissions = INTERNET

android.archs = arm64-v8a,armeabi-v7a
android.allow_backup = True
