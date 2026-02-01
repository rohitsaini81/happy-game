from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.spinner import Spinner
from kivy.uix.popup import Popup
from kivy.core.window import Window

from create import get_all_games, create_game_result
from datetime import date


Window.size = (420, 520)


class GameForm(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(orientation="vertical", padding=20, spacing=12, **kwargs)

        # Title
        self.add_widget(Label(
            text="Game Form",
            font_size=20,
            size_hint_y=None,
            height=40
        ))

        # Load games
        games = get_all_games()
        self.game_options = [
            {"id": g[0], "code_name": g[1], "name": g[2]}
            for g in games
        ]

        self.spinner = Spinner(
            text="Select a game",
            values=[str(g) for g in self.game_options],
            size_hint_y=None,
            height=44
        )
        self.add_widget(self.spinner)

        # Result input
        self.add_widget(Label(text="Result"))
        self.result_input = TextInput(
            multiline=False,
            input_filter="int",
            hint_text="Enter result (1–100)"
        )
        self.add_widget(self.result_input)

        # Date input
        self.add_widget(Label(text="Result Date (YYYY-MM-DD)"))
        self.date_input = TextInput(
            multiline=False,
            text=date.today().isoformat()
        )
        self.add_widget(self.date_input)

        # Description (optional)
        self.add_widget(Label(text="Description (optional)"))
        self.desc_input = TextInput(
            multiline=True,
            size_hint_y=None,
            height=100
        )
        self.add_widget(self.desc_input)

        # Submit button
        submit_btn = Button(
            text="Submit",
            size_hint_y=None,
            height=48
        )
        submit_btn.bind(on_press=self.submit_form)
        self.add_widget(submit_btn)

    def popup(self, title, message):
        Popup(
            title=title,
            content=Label(text=message),
            size_hint=(0.8, 0.4)
        ).open()

    def submit_form(self, instance):
        game_text = self.spinner.text
        result_text = self.result_input.text
        date_text = self.date_input.text

        if game_text == "Select a game":
            self.popup("Error", "Please select a game.")
            return

        if not result_text:
            self.popup("Validation Error", "Result value is required.")
            return

        if not date_text:
            self.popup("Validation Error", "Result date is required.")
            return

        try:
            result_date = date.fromisoformat(date_text)
        except ValueError:
            self.popup("Validation Error", "Date must be YYYY-MM-DD.")
            return

        if not result_text.isdigit():
            self.popup("Validation Error", "Result must be a whole number.")
            return

        result = int(result_text)

        if result <= 0 or result > 100:
            self.popup("Validation Error", "Result must be between 1 and 100.")
            return

        game = eval(game_text)  # safe here because it's your own generated data

        create_game_result(
            result,
            game["name"],
            result_date,
            game["id"],
            game["code_name"]
        )

        self.popup(
            "Success",
            f"Game: {game['name']}\nResult: {result}"
        )

        self.result_input.text = ""


class GameApp(App):
    def build(self):
        return GameForm()


if __name__ == "__main__":
    GameApp().run()

