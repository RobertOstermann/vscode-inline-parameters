import os
from tkinter import messagebox


def one_argument(fname):
    print(fname + " Refsnes")


# A single argument
one_argument("Example")


def two_arguments(fname, lname):
    print(fname + " " + lname)


# Two arguments
two_arguments(fname="Example", lname="File")


def multiple_arguments(*kids):
    print("The youngest child is " + kids[2])


# Arbitrary number of arguments
multiple_arguments("Emil", "Tobias", "Linus")


def keyword_arguments(child3, child2, child1):
    print("The oldest child is " + child1)
    print("The middle child is " + child2)
    print("The youngest child is " + child3)


# Arguments with key = value syntax
keyword_arguments(child1="Emil", child2="Tobias", child3="Linus")


def arbitrary_keyword_arguments(**kid):
    print("His last name is " + kid["lname"])


#  A dictionary of key = value pair arguments
arbitrary_keyword_arguments(fname="Tobias", lname="Refsnes")


def default_arguments(city="New York City", state="New York"):
    print("I am from " + city + ", " + state)


# Default arguments
default_arguments("Dallas", "Texas")


def slow_example(self) -> None:
    with open(R"file") as file:
        settings = file.readlines()

    for line in settings:
        split = line.split()

        if split[0] == "Path":
            path = split[1].replace("\n", "")
    if not os.path.exists(path):
        messagebox.warning(
            self,
            "Error",
            "Unable to launch",
            messagebox.OK
        )

    os.startfile(path)

    return


class Item:
    def __init__(self, name, price, quantity) -> None:
        self.name = name
        self.price = price
        self.quantity = quantity

    def calculate_total_price(self, x, y) -> int:
        return x * y


item1 = Item("Phone", 100, 5)
print(item1.calculate_total_price(item1.price, item1.quantity))

item2 = Item("Laptop", 1000, 3)
print(item2.calculate_total_price(item2.price, item2.quantity))
