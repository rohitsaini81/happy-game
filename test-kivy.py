from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.core.text import LabelBase

LabelBase.register(
    name="Emoji",
    fn_regular="/usr/share/fonts/noto/NotoColorEmoji.ttf"
)

class TestApp(App):
    def build(self):
        box = BoxLayout(orientation="vertical", padding=20)

        box.add_widget(Label(
            text="Kivy is alive",
            font_size=32
        ))

        box.add_widget(Label(
            text="🧠✨🎮",
            font_name="Emoji",
            font_size=40
        ))

        return box

TestApp().run()

