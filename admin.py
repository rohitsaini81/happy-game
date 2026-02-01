import tkinter as tk
from tkinter import ttk, messagebox
from create import get_all_games, create_game_result
import ast
from datetime import date


def submit_form():
    game = game_var.get()
    result = result_entry.get()
    result_date_str = date_var.get()
    if game == "Select a game":
        messagebox.showerror("Error", "Please select a game.")
        return

    # Result is required
    if not result:
        messagebox.showwarning(
            "Validation Error",
            "Result value is required."
        )
        return

    # Date is required
    if not result_date_str:
        messagebox.showwarning(
            "Validation Error",
            "Result date is required."
        )
        return

    # Validate date format
    try:
        result_date = date.fromisoformat(result_date_str)
    except ValueError:
        messagebox.showwarning(
            "Validation Error",
            "Date must be in YYYY-MM-DD format."
        )
        return


    # Must be an integer (no text, no decimals)
    if not result.isdigit():
        messagebox.showwarning(
            "Validation Error",
            "Result must be a whole number (no letters or decimals)."
        )
        return

    result = int(result)

    # Range checks
    if result <= 0:
        messagebox.showwarning(
            "Validation Error",
            "Result must be greater than 0."
        )
        return

    if result > 100:
        messagebox.showwarning(
            "Validation Error",
            "Result must be less than or equal to 100."
        )
        return



    try:
        int(result)
    except ValueError:
        messagebox.showerror("Error", "Result must be an integer.")
        return

    game = ast.literal_eval(game)

    print(game)
    # today = date.today()
    # create_game_result(result, game['name'], today, game['id'], game['code_name'])
    create_game_result(
        result,
        game['name'],
        result_date,
        game['id'],
        game['code_name']
    )


    messagebox.showinfo("Success", "Game :"+game['name'] + " \nresult :"+str(result))
    # messagebox.showinfo("Success",f"Result saved for {game['name']}.")

def minimize():
    root.iconify()

def maximize():
    root.state("zoomed")

def close_app():
    root.destroy()

# Root window
root = tk.Tk()
root.title("Game Form")
root.geometry("420x380")
root.configure(bg="#1e1e2e")

# Style config
style = ttk.Style()
style.theme_use("clam")

style.configure(
    "TLabel",
    background="#1e1e2e",
    foreground="#ffffff",
    font=("Segoe UI", 10)
)

style.configure(
    "TButton",
    font=("Segoe UI", 10),
    padding=6,
    background="#6c63ff",
    foreground="white"
)

style.map(
    "TButton",
    background=[("active", "#5a54e6")]
)

style.configure(
    "TEntry",
    padding=6
)

# Top bar
top_bar = tk.Frame(root, bg="#161622", height=40)
top_bar.pack(fill="x")

tk.Label(
    top_bar,
    text="🎮 Game Form",
    bg="#161622",
    fg="white",
    font=("Segoe UI", 11, "bold")
).pack(side="left", padx=10)

btn_frame = tk.Frame(top_bar, bg="#161622")
btn_frame.pack(side="right", padx=5)

tk.Button(btn_frame, text="—", command=minimize, bg="#161622", fg="white", bd=0).pack(side="left", padx=5)
tk.Button(btn_frame, text="⬜", command=maximize, bg="#161622", fg="white", bd=0).pack(side="left", padx=5)
tk.Button(btn_frame, text="✕", command=close_app, bg="#161622", fg="#ff5c5c", bd=0).pack(side="left", padx=5)

# Card container
card = tk.Frame(root, bg="#2a2a40", padx=20, pady=20)
card.pack(padx=20, pady=20, fill="both", expand=True)

# Game dropdown
ttk.Label(card, text="Game").pack(anchor="w", pady=(0, 5))
game_var = tk.StringVar(value="Select a game")

games = get_all_games()

game_options = [
    {"id": game[0],"code_name":game[1], "name": game[2]}
    for game in games
]

ttk.OptionMenu(card, game_var, game_var.get(), *game_options).pack(fill="x")

# Result input
ttk.Label(card, text="Result").pack(anchor="w", pady=(15, 5))
result_entry = ttk.Entry(card)
result_entry.pack(fill="x")

# Date input
ttk.Label(card, text="Result Date (YYYY-MM-DD)").pack(anchor="w", pady=(15, 5))

date_var = tk.StringVar()
date_var.set(date.today().isoformat())  # default = today

date_entry = ttk.Entry(card, textvariable=date_var)
date_entry.pack(fill="x")


# Description
ttk.Label(card, text="Description (optional)").pack(anchor="w", pady=(15, 5))
desc_text = tk.Text(
    card,
    height=4,
    bg="#1e1e2e",
    fg="white",
    insertbackground="white",
    relief="flat"
)
desc_text.pack(fill="x")

# Submit button
ttk.Button(card, text="Submit", command=submit_form).pack(pady=20)

root.mainloop()
