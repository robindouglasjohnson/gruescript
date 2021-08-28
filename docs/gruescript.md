# Creating Text Adventure Games on Your Computer With Gruescript

Robin Johnson

This work is licenced under the Creative Commons Attribution 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA
94042, USA.

## Foreword

I was trying to play *Pirate Adventure* on my phone when I came up with the format of the games that Gruescript would create.

*Pirate Adventure* is the second of the Adventure International titles
by Alexis and Scott "not to be confused with *Garfield* creator and
twitter crank who gets annoyed when you misremember which comic
he made Scott Adams" Adams. In the late 1970s, when Adventure and Zork
could only be played at university campuses, the Adamses brought
interactive fiction to the first generation of home microcomputers. The
tiny memories of those machines put severe constraints on the games'
writing. The result was a subgenre of parser games with terse,
efficient prose -- single-sentence room descriptions, making
resourceful use of tropes and stock characters so that the player's
imaginations could do the work of visualisation -- backed up by
ingenious puzzle design. *Inform* creator Graham Nelson wrote in *The
Craft of Adventure* that the Adamses' games invoke "the feeling of
holding a well-made miniature, a Chinese puzzle-box with exactly-cut
pieces.

Modern parser games are no longer limited by memory, of course, but I
feel that there's still a place, a purpose, and an audience for games
in that  'puzzlebox' style. Writing under constraints can be an
enjoyable and challenging sort of creativity in itself, like composing
a haiku. And the terse prose of these games would make them perfect for
a phone or tablet screen  -- if it weren't for the need for the player
to type.

In the last decade or so, hobbyist and indie interactive fiction has
seen an explosion in form, with systems like Twine, ChoiceScript and
Inkle making web and mobile IF more accessible and democratised for
players and authors alike.<sup>\*</sup>  Most games made in these
systems are story-centric rather than puzzle-centric:  that's what web
and mobile interfaces are best for delivering, and it's what
the development systems are best for creating. The development systems,
the interfaces available, and the feel of the games produced are
intricately related. For parser IF, the barrier to that sort of
immediate accessibility is the interface. I don't just mean that mobile
devices don't have keyboards. The golden age of parser games happened
when the standard way of interacting with a computer was by typing at a
prompt. Command prompts were intuitive to players at the time, just as
links and buttons are intuitive now.

So, how do we revive the puzzlebox feel for mobile-friendly games? If
all the player's possible choices must be visible on the screen all the
time, how can we pose a puzzle without immediately giving the solution
away?

I first tried to solve this problem in 2016, with a game called
*Draculaland*.  Using JavaScript running in a simple, client-side web
page, I created a world model of interconnected rooms containing
objects that can be arbitrarily picked up and moved around -- the basic
structure that's taken for granted in parser games, but which choice
systems don't tend to bother with. (Some authors, like Astrid Dalmady
and Josh Labelle, have implemented this sort of world model
impressively in Twine games, but Twine didn't make it easy for them.) I
added buttons for movement between the rooms, and gave each object an
associated list of 'active verbs' that change depending on the game
state. For example, any portable item has the 'take' verb active when
it's lying on the floor, or  'drop' if it's being carried by the player.
Special actions can then be made possible at certain points in the
game -- for example, if the player is standing in the graveyard while
carrying the shovel, the verb 'dig' activates.  This is a simple
example, but it's essentially a parser-game puzzle: the player has to
make the mental connection between the shovel and the grave, then
navigate back to the right spot, through a generalised interface that
doesn't give the secrets of the game away, to try out their idea.

The second game I made with that JavaScript engine, *Detectiveland*, 
won that year's Interactive Fiction Competition. It was the first 
non-parser game to do so. I've made several games with the
same engine since, and had enquiries from authors asking whether they
could use it to write their own games. Usually I told them I planned to
package it up neatly one day, but for now they were free to grab the
source and modify it. Nobody did. I could have published the engine as
a sort of library, which people would use to write their own games in
JavaScript -- but judging by various attempts to make parser game
libraries in JavaScript and other general-purpose languages over the
years, those don't really take off: if an author is willing to use a
general-purpose language,  they're probably the sort of author who'll
just write their own engine.

But the game data itself didn't have to be JavaScript. The components of
the games themselves were defined as relatively simple objects:
'rooms', 'things',  'verbs' and 'rules' -- which could easily be
imported from a text file using a simple(ish) script syntax. I modelled
the syntax on the assembler-type language used in the Adventure
International games, available to modern developers as  'ScottKit',
because the JavaScript games were very similar in structure -- the only
extra information needed was a way to tell the game which verbs to
activate, for which things, under what circumstances.

Two of the hobbyist game development systems that I find most
interesting are Adam Le Doux's *Bitsy* and increpare's *Puzzlescript*.
Bitsy creates tiny,  pixel-art style games with very little support
for puzzles. It's used to create short-form narrative games, often
telling highly personal stories from authors in marginalised groups.
Puzzlescript makes 2d graphical puzzle games like Sokoban, again with a
retro pixel-art aesthetic. Both have web-based development
environments: authors work in an editor running in the Bitsy or
Puzzlescript web page, then eventually download their game as an HTML
document that they can share on their own itch.io page or elsewhere.
Both systems are accessible and cute, and they've both gained strong
followings, with regular game jams and popular fan-made mods.

That sort of web-based development environment seemed like the ideal
model for a tool to create keyboardless puzzlebox text adventure games,
which, like Bitsy and Puzzlescript games, will run in web pages
themselves. I called it Gruescript, because I'd just done a game about
grues, and I'm obsessive like that.

<sub>\* I want to make one thing extremely clear: this is awesome.
All kinds of IF, from all kinds of creator, are valid, are welcome,
and enrich the genre.</sub>


## Blocks

The basic units of Gruescript code are **blocks** of one or more lines.
The first line of each block begins with one of the nine 'block type'
keywords -- that's how Gruescript knows where a new block starts. The
block types are:

`game`
: Contains the game title and metadata, and any instructions to be run when
the game begins. There must be exactly one game block in your Gruescript code.


`room`
: A location in the game

`thing`
: Anything that physically exists in the game world, except rooms
and the player character. This includes portable and non-portable
items, scenery, and non-player characters.

`proc`
: A procedure: a list of instructions that is remembered by its name, so it
can easily be run from anywhere else in the code. More than one
procedure block can have the same name (they will be run in turn until
one succeeds.)

`rule`

: A rule is like a procedure, but it does not have a name and cannot be run
from other code. All rules are run automatically, after every turn during
gameplay.

`verb`
: A set of instructions that is run when the player performs a
particular verb. This can be declared for a particular verb being
applied to a particular thing (**specific verb blocks**), or for a
general definition of a verb (**general verb blocks**). There can be
several `verb`  blocks for the same verb, or the same pair of verb and
thing.

`setverb`
: Setverbs determine whether a given verb is active. Like verb
blocks, setverb blocks can be thing-specific or general, and there
can be multiple setverb blocks for the same verb and/or thing.
Setverbs run more often than
rules -- as well as every turn, they also run when the player
changes the inventory item they are 'holding'.

`var`
: A variable, which can be a number or a string. Variables do not
have to be declared to be used; Gruescript understands no
difference between an undeclared variable and a variable with a
numeric value of zero. Variable blocks always have exactly one
line.

`tagdesc`

A 'visible' tag. Tags are keywords associated with
rooms and things. Some tags, such as `lightsource`
or `wearable`, have
special meanings to Gruescript; others can be arbitrarily made up
by the author to use in rules and verbs. Generally, tags do not
have to be declared, but any tag declared with `tagdesc`
becomes 'visible', meaning it has a description that
will be printed alongside any thing that has that tag. These
blocks always have exactly one line.

### The `game` block

Gruescript code should contain exactly one `game` block,
normally at the very beginning of the Gruescript file. The block must
contain at least the game title, and usually contains further
metadata and any instructions (usually `say` commands) to be run at the
beginning of the game. Here's an example:

	game Spaceships Versus Kitten
	id SVK
	author Ermintrude Snodbury
	version 1.0.0
	person 2
	examine on
	conversation on
	wait on
	say You were minding your own business and playing with a ball of \
	    wool one day when an alien spaceship crashlanded right next \
	    to your cat tree!
	say
	# Released under the Foobar Licence
	# &lt;http://foobar.madeupurl/licence-terms&gt;


Let's go through each of these lines in turn.

	game Spaceships vs Kittens

The title of the game.

	id SVK

An identity code for the game. This is used in local storage (cookies)
to identify saved games and options. If you host more than one
Gruescript game on one site, they must all have different ids.

	author Ermintrude Snodsbury

The author's name (or authors' names). If present, this will be
displayed with the game title at the beginning of play.

    person 2

The number after `person` can be 1 or 2, determining whether the game
will be in the first person ("I am in...") or second person ("You are
in...") This game will be in second person.

This only affects the display and default messages -- your room
descriptions and so on will have to be written with the right person in
mind. If there is no `person` line, the game will default to second
person.

	examine on

If this line is present, every 'thing' in the game will be displayed as
a button which the player can click to examine that thing. `examine`
is a 'native verb', meaning every Gruescript game will know the verb
without the author having to define it.

	conversation on
	
If this line is present, the game will use Gruescript's "ask/tell/say"
conversation system. The verbs `talk`, `ask`, `tell`, `say`, and
`end_conversation`, as well as any verbs that *begin* with `ask_`, `tell_` or
`say_`, will be handled specially. If the game block contains `conversation off`,
or no `conversation` line, the conversation system will not be used and
you are free to define these verbs how you like.

	wait on

This means that the native verb `wait` will be available throughout the
game, shown as a button below the room contents. If this line is
`wait off`, the button will not be present (but the native verb will
still exist, and can be made available using an intransitive setverb --
see the chapter on verbs.)

Unlike `examine`, Gruescript's default behaviour if this line is
omitted is to consider `wait` 'on'.

	say You were minding your own business and playing with a ball of \
	    wool one day when an alien spaceship crashlanded right next \
	    to your cat tree!

These are instructions that will be run when the game starts, before the
title and author are printed. Only one kind of instruction is used here,
the command `say`, which prints the rest of the text on the line. The
second `say` command, as it has no text after it, will print a blank
line.

Normally, a single Gruescript instruction fits on a single line of
code. In the `say` instruction here, the backstrokes (`\`) tell
Gruescript that this instruction continues on the next line.

Additionally, the `game` block may contain `colour` (or `color`) lines,
which configure the game's colour palette. These are explained in
Appendix I.

### Comments

The hash character (`#`) denotes **comments**; these are for authors
to keep notes and annotate code, and are completely ignored by
Gruescript. The hash can come at the beginning of a line, in which case
the whole line is ignored, or partway along a line, in which case
anything after it is ignored (If you want to output a '#' character in
your game, as part of a message, room description, or anything else,
use the HTML entity `&num;`.)

Our example game block contains the comment:

	# Released under the Foobar Licence
	# &lt;http://foobar.madeupurl/licence-terms&gt;

While entirely meaningless to Gruescript, it is a good idea to put any
licence information in comments in your script near the top of the code.
Gruescript itself is released under the MIT License. When you export
your game from Gruescript to an HTML page, the engine code itself will
be marked with that licence, but you are free to apply whatever licence
you wish to your script.

## Rooms

The locations in your game world are called **rooms**; a game will not
work at all without at least one room. Of course, a room doesn't have to
correspond to a literal room -- it might be a corridor, a garden, or one
end of a large ballroom.

Rooms are defined using `room` blocks. Here's a simple example. The
first line begins the declaration and contains the room's name (which
will be used internally by Gruescript) and description (which will be
seen by the player.) The rest of the lines can come in any order.

	room by_fountain You're in a walled garden by a fountain.
	north summer_house
	east potting_shed
	tags outdoors garden
	prop wall_colour red

This room's internal name is `by_fountain`. The name can consist of
letters, numbers and underscores, is case sensitive (like everything
else in Gruescript), and must be unique -- no other rooms or things can
be named `by_fountain`. The rest of the first line is the description of
the room that the player will see when they are in that room.

The second and third lines in our example are directions. These tell
Gruescript where the player can move to from the fountain room:
north to `summer_house` or east to `potting_shed` (both of which must be
defined in their own `room` blocks elsewhere.) The directions Gruescript
understands in this way are:

- the cardinal and secondary compass directions: `north`, `northeast`,
  `east`, `southeast`, `south`, `southwest`, `west`, and `northwest`
- `up`, `down`, `in` and `out`
- the shipboard directions `fore`, `aft`, `port` and `starboard`

A connection between two rooms has to be declared from both of them --
that is, the room block for `summer_house` will need to contain a line
`south by_fountain`, or the connection will be one-way.

If you want to use unconventional directions that aren't listed above,
use `dir` lines in your room block:

	room brass_bridge You're on the Brass Bridge.
	dir widdershins patricians_palace
	dir turnwise broad_way

## Room verbs

Rooms may have a `verbs` line:

	room dance_floor
	verbs tapdance robot limbo

The verbs listed on this line will become the room's 'permanent verbs',
available to the player whenever they are in the room. They are listed
in an 'Actions' line just below the room description. Attaching verbs
to rooms is intended to be the exception rather than the norm; most
verbs will be attached to things rather than rooms (see the next
chapter.)

## Tags

Rooms may optionally have any number of arbitrary **tags**, added in
the block with lines beginning `tags` -- there can be any number of
`tags` lines in a room block, and each tags line can contain any number
 of tags. A tag can be whatever you like, as long as it is a string of
letters, numbers and underscores. Our fountain room has the tags
`outdoors` and `garden`.

Tags are usually things that you make up yourself to use in the logic
of your game's verbs and rules -- for example, we might later write a
rule that gives the player messages about the weather if they are
outside, or certain verbs might have different effects in 'garden'
rooms.  Some tags for rooms have special meanings in Gruescript:

`start`
: means the player starts the game in this room. No more than one room
should have this tag. If there is none, the player starts in the first
room declared in your Gruescript.

`dark`
: means the room is dark, and the player will not be able to see the
room description or objects in it unless a light source (i.e. a thing
with the tag `lightsource`) is present, either in the room or carried
by the player. (They will be able to see the available directions. If
you want to make an exit from a room that a player can only use if they
can see, either use a non-portable thing such as a ladder with a
`climb` verb, or use `open` and `close` commands in rules -- see the
chapters on instructions and rules.)

## Properties

	prop wall_colour red

Things may have any number of **properties**. A property is something
like a tag, but instead of just being there or not there, it has a
*value* which can be a number, a word or a string of one or more words.
In this case, the room's property `wall_colour` has the value `red`.
This could be used for just about anything -- perhaps there is a bull
roaming the game world whose behaviour depends on the colours of the
walls around him. The property value can be referred to from an
instruction by something like `by_fountain.wall_ colour`, or
`$room.wall_colour` -- we'll explain more about this in the chapter on
instructions.

Like variables, properties don't have to be declared to be used by code
later. If a property is referenced without having been declared, it is
treated as though its value is the number zero.

### Special properties

Only one property of rooms is special in Gruescript: `desc`, which
contains its description -- usually the same text that is supplied
after the room name in the first line of its `room` block. This:

	room stable You're in a shed smelling of horses.

does exactly the same as:

	room stable
	prop desc You're in a shed smelling of horses.

The point of the description being accessible as a property is to make
it possible to change that description during the game -- perhaps
spraying an air freshener gets rid of the smell, which would be done
with an instruction like `write stable.desc You're in a shed that
smells lovely.` -- see the chapter on instructions for more about this.

## Things

A thing is any physical object in your game world -- portable and
non-portable items, scenery, non-player characters, and anything else.
They are defined in `thing` blocks, like this:

	thing top_hat blue top hat
	name hat
	desc A tall stovepipe hat in royal blue velvet.
	loc bedroomtags portable wearable posh
	prop material velvet

Going through this example line by line:

	thing top_hat blue top hat

The beginning of the `thing` block: this thing has the internal name
`top_hat`, and the *short description*  (or 'display name') "blue top 
hat", which is how it appears in a room or player inventory during 
gameplay.

	name hat

This is the 'screen name' of the hat, the one that is used in certain
places such the mock command prompt -- if the player clicks `wear` next
to the hat, this means that they will see the prompt `&gt;wear hat`.
(If this is omitted, Gruescript will use the internal name and replace
underscores with spaces, in this case making the reasonable guess `top
hat`.) It is often useful to create two or more similar items with the
same screen name, so that they can be swapped without the player
noticing -- for a classic example, a lit lamp and an unlit one.

	desc A tall stovepipe hat in royal blue velvet.

`desc` gives the long description of the thing, which the player will
see when they `examine` it. In a game with `examine on`, these should
be present for all, or nearly all, things. There can be several `desc`
lines in the same thing block, in which case they all run together into
a single description (with a space between each line, but not a line
break -- if you want a line break in your description, use the HTML
`&lt;br&gt;`.)

	loc bedroom

The location of the thing, specified by the (internal) name of a room.
If there is no `loc` line in the thing block, the thing will start
'offstage' (unless it is `carried`) until it is placed somewhere by a
`bring` or `put` command (see the chapter on instructions).

	tags portable wearable posh

Things can be given tags in exactly the same way as rooms. Several tags
have special meanings to Gruescript; the most useful of these is
`portable`, which means the thing can be carried by the player -- a
portable item will always have the native verb `drop` activated when it
is in the player's inventory (unless it is being worn), and `take`
when it is not. Our top hat also has the special tag `wearable`,
meaning the player can `wear` and `remove` it (like `take` and `drop`,
these are both native verbs and will be activated and de-activated by
Gruescript), and the author-defined tag `posh`.

	prop material velvet

Like rooms, things may have any number of properties, set with `prop`
lines. This hat has the property `material` with the value `velvet`.

Two of the most important lines in `thing` blocks, which were not in
our top hat example, are `verbs` and `cverbs`. These give the thing its
usual set of active verbs -- verbs specifies the thing's **permanent
verbs**, which will *always* be active for the thing (they
*cannot* be de-activated, even by a setverb), and `cverbs`
specifies **carried verbs** that will be active whenever the
thing is in the player's inventory (they cannot be de-activated
while the thing is carried, but they *can* be activated by a
setverb while it is *not* carried.) Either of these, like tags,
can be declared over multiple  lines if necessary.

Any thing block can contain `verbs` lines, `cverbs` lines, or both, but
it is more usual for portable things to have carried verbs and
non-portable things to have permanent verbs. For example, it makes
sense that a warning sign on the wall of a room

	thing sign Warning sign on wall
	verbs read

can be read whenever the player can see it, whereas a booklet

	thing booklet
	cverbs read

can only be read if the player is carrying it.

If a thing block contains a line with the single word

	carried

it will start the game in the player's inventory.

### Special tags

The following tags have special meanings for things in Gruescript:

`portable`
: This item can be `take`n, carried around in the player's inventory,
and `drop`ped. Gruescript will handle the activation and de-activation
of these  verbs. (You can use setverbs to activate take or drop when
they would not  normally be active, but not to de-activate them when
they would not; if you  want to mess with this logic, use a *non*
-portable item; the verbs will still work, but you can control when
they will be set using setverbs.)

`wearable`
: This thing is an item of clothing. When it is in the player's
inventory, the  native verb wear will be activated; while it is worn,
it will have the tag  worn, and the verb remove will be activated.

`alive`
: This thing is a living creature. This affects the order that nouns
are  displayed in -- alive things are usually listed first in room
contents.

`conversation`
: If your game has `conversation on`, this means that the thing can be
talked to. It will automatically have the verb `talk` activated (unless
the player is already talking to it.)

`lightsource`
: This thing provides light; if it is present in a dark room (whether
or not  the player is carrying it), that room and its contents will be
visible.

`plural`
: The name of the thing is plural, and should be treated as such with
respect  to pronouns and other grammar. This should be set if the
thing's *screen name* (i.e. the name given in its thing block) is
plural, rather than its internal  name or short description. For
example,

	thing flowers bouquet of flowers
	tags plural

is correct (as its screen name will be "flowers", plural),

	thing flowers bouquet of flowers
	name bouquet

should *not* have `plural`, or it may get referred to as "some bouquet".

`mass_noun`
: The name of the thing is a mass noun, like 'salt' or 'mud' -- not
plural, but not a discrete singular item. By default, Gruescript will
use 'some' instead of 'a/an' when referring to this noun in the indefinite
case. The indefinite form is based on the thing's *short description*,
not its screen name, so `thing sugar bag of sugar` should *not* have this
tag ("a bag of sugar"), but `thing grass tall grass` should have it
("some tall grass").

`male`, `female`, `nonbinary`
: This thing has gendered pronouns: 'he/him' for male, 'she/her' for
female, or 'they/them' for nonbinary. If a thing has none of these
tags, its pronoun will be 'it', or 'they/them' if it is `plural`.

`list_last`
: Things with this tag will always be listed last in the room window
(and scroller, if the "list objects in scroller" option is enabled),
regardless of whether they are portable or alive.

`quiet`
: Things with this tag will not be listed at all in the scrolling
window,  regardless of the display options; this does not affect their
listing in the  room window. It's intended to be used for things that
are duplicated in the  room description, so the player won't see
something like " You are next to a  church. You can also see a church."

### Special properties

The following properties of things have special meaning to Gruescript.

`name`
: The *screen name* of the thing (same as beginning a line in the thing
block  with name, as described above).

`display`
: The *short description* of the thing (same as the text that comes after
the thing's internal name in the first line of the thing block)

`desc`
: The *long description* of the thing, used by the 'examine' verb (same as using `desc` at the beginning of a line in the thing block)

`loc`
: The current location of the thing. This property should be treated as
read-only. If you want to change the location of a thing, use the
command `put` (see the chapter on instructions.)


`def`
: How the thing should be referred to by the definite article ("the").
If this  property does not exist, Gruescript will simply prefix the
screen name of the  thing with the word "the" (unless it has the
`proper_name` tag.) If you don't  want your thing to be referred to
this way, you might set it to something like  "Ford's towel" or "door
number 2".


`indef`
: How the thing should be referred to by the indefinite article ('a' or
'an').  By default, Gruescript will prepend the thing's short description 
(*not* its screen name) with 'a', 'an' if  it begins with a vowel (which 
won't always be right!), 'some' if it is plural or a mass noun,  or omit 
the article if it is a `proper_name`. Examples: "a unicorn", "lots of 
beer".

Note that some of these, such as `name` and `desc`, overlap in purpose
with lines  in the `thing` block that have already been explained. This
is mainly for  convenience -- many or most things will have screen
names and descriptions, so you need not use `prop` every time. `name
giraffe` in a thing block does exactly the same as `prop name giraffe`.
The fact that they also exist as properties allows them to be read and
modified during gameplay -- for example,  you might want to change the
giraffe's screen name to "Jeffrey" after it  introduces itself to the
player, with `assign giraffe.name Jeffrey` (don't  forget to change its
`display` property too.) There will be more on this in the  chapter on
instructions.

### Pronouns

If you want to give a thing a set of pronouns that is not covered
by the standard `male`, `female`, `nonbinary` or `pronoun` sets, you
can use `pronoun` lines in its block like this:

	pronoun nom xe
	pronoun obj xem
	pronoun pos xyr
	pronoun ind xyrs
	pronoun ref xemself

where `nom`, `obj`, `pos`, `ind` and `ref` mean the nominative, objective
(or accusative), possessive (or pronomial possessive), independent 
possessive (or predicative possessive) and reflexive pronouns. These
are the same references used in braced expressions (see the chapter on
instructions.)

## Instructions

With your knowledge of rooms and things, you are now able to create a
rudimentary game world: interconnected rooms, containing things, some
of which  are portable and the player can pick up, carry around, and
drop in other  rooms.

While I've no doubt that some people would be able to make impressive
games without using any other features of Gruescript, any complex
interactions  or puzzles will need to be added using procedures and
rules. Before we can get  to those, we need to introduce something they
all depend on: **instructions**.

Instructions are lines of code that print messages, manipulate objects,
compare  variables, and so on. They will be familiar (and relatively
simple) to you if  you've used any sort of programming language. Blocks
for verbs, setverbs and  rules -- which we'll look at in depth in the
following chapters -- are mostly  made up of lines of instructions.

There are three kinds of instructions:

- **Commands** tell Gruescript to do something, like print a message
or move  a thing to a room

- **Assertions** test a condition, like whether the player is carrying
a  particular thing. An assertion is said to 'succeed' (or pass) if
its condition  is true, or to 'fail' if it is false. In any series of
instructions belonging  to a verb, setverb or rule block, Gruescript
will start at the beginning and  run (or 'execute') the instructions in
order until an assertion fails,  then print that assertion's message
(if it has one) and stop.

- **Iterators**  tell Gruescript to repeat the rest of the
instructions in  their block, subject to certain conditions. These are
also a sort of assertion,  as they can succeed or fail.

If an assertion inside a block fails, that block itself -- the `verb`,
`setverb`, `rule` or `proc` block -- is also considered to have
failed (there  can be exceptions to this if the block contains
iterators, but we'll get to  those later.) Conversely, if all the
instructions in the block run without any  failed assertions, the block
is considered to have succeeded. A block with no  instructions, or
only commands, will always succeed. This will become important  in the
later chapters on verbs, procedures and rules.

Most instructions have one or more 'arguments' -- input values that are
sent to  the instruction when it is called. These can be numbers
(integers only), names  of things or rooms (use the internal names),
variable names, or strings (of  words). An instruction's arguments are
supplied after the instruction name  itself, separated by spaces.
Strings always come last, so there is no need for  quotemarks or other
delimeters. (Whitespace in strings is always normalised --  that is,
any leading or trailing spaces are removed, and any contiguous spaces
are reduced to a single space -- there is no distinction between
"&nbsp;foo bar" and "foo&nbsp;&nbsp;bar&nbsp;&nbsp;&nbsp;&nbsp;".)

Instructions (and any other line in Gruescript) can be wrapped over two or
more lines.

### Commands

A simple command line might look like:

	bring football: A football smashes through the ceiling and lands at your feet!

This starts with the keyword for the command that is being used (
`bring`), then supplies that command with its argument (in this case, a
single *thing*, the football). Optionally, after a colon (`:`), comes
a message that will be printed after the command is completed.

The Gruescript commands, shown with their arguments in italics, are:

<code>bring <i>thing</i></code>
: Move a thing to the room that the player is in. If the player is
carrying or holding the thing, it will be removed from their inventory
and placed 'on the floor'.

<code>hide <i>thing</i></code>
: Set a thing's 'location' to nothing, so that it is effectively
removed from the game, regardless of where it is now (if anywhere), or
whether it is carried.

<code>give <i>thing</i></code>
: Put a thing into the player's inventory -- they will be 'holding' the
new thing, and the thing they were previously holding (if any) will be
returned to their main inventory.

<code>carry <i>thing</i></code>
: This is identical to give, except that the player will not be holding
the thing; it will be placed in their main inventory. The thing they
were holding, if any, will be unchanged.

`unhold`
: Set the player's 'holding' slot to empty. If the player was holding
a thing, it will be returned to their main inventory.

<code>wear <i>thing</i></code>
: Make the thing be worn by the player. If the thing is portable and
was not currently in the player's inventory, it will be 'given' to
them first. If it is *not* portable and was not in the player's room,
it will be moved there.

<code>unwear <i>thing</i></code>
: Make the thing not worn by the player. If it is portable, it will be
returned to the player's main inventory, but it will not become 'held'.

<code>put <i>room</i></code>
: Move a thing to particular room. If the player was holding or
carrying the thing, it will be removed from their inventory.

<code>putnear <i>thing</i></code>
: Move the first thing to the location of the second thing. If the
first thing is being held or carried, it will be removed from the
player's inventory. If the second thing is being held or carried, the
first thing will be put into the room that the player is in.

<code>goto <i>room</i></code>
: Move the player to a room.

<code>swap <i>thing thing</i></code>
: Swap the locations of two things. This treats 'held' and 'carried' as
if they were locations, so if the player was holding/carrying one
thing, they will now be holding/carrying the other.

<code>tag <i>thing/room tag</i></code>
: Add a tag to a thing or room's tag list. If it already had this tag,
there is no effect.

<code>untag <i>thing/room tag</i></code>
: Remove a tag from a thing or room's tag list. If it did not already
have this tag, there is no effect.

<code>tagroom <i>tag</i></code>
: Add a tag to the tag list of the room the player is in. If the room
already had this tag, there is no effect.

<code>untagroom <i>tag</i></code>
: Remove a tag from the tag list of the room the player is in. If the
room did not already have this tag, there is no effect.

<code>clear <i>tag</i></code> clear
: Remove this tag from all things and rooms that have it.

<code>assign <i>variable value</i></code>
: Set a variable to a value, which must be a number or a single word.

<code>write <i>variable value</i></code>
: Set a variable to a string, which can be any number of words and may include
braced expressions (see below).

<code>add <i>variable number</i></code>
: Add a number to the value of a numeric variable. Like all numbers in
Gruescript, the number must be an integer. If you need to subtract a
number, `add` a negative value.

<code>random <i>variable number</i></code>
: Set the value of a variable to a random integer from 1 to the
specified number (inclusive) -- the equivalent of rolling a single
n-sided die.

<code>freeze <i>variable</i></code>
: This evaluates any braced expressions (see below) in a string
variable and then re-assigns the result to the variable, effectively
'freezing' the value of the valuable so that it will no longer be
affected if the values of the variables in the expressions change. (The
'frozen' variable itself *can* still be changed by `assign` or `write`.)

<code>say <i>string</i></code>
: Print a message (as a single HTML paragraph). The string is output as
 HTML, so it can contain markup *(but not colons! Use CSS classes
rather than inline style.)* It can also include braced expressions
(see below).

<code>sayat <i>room string</i></code>
: Print the string only if the player is in the specified room.

<code>die <i>string</i></code>
: End the game, printing the string between triple-asterisks   \*\*\*
like this \*\*\*. If the string is omitted, the message will be "I am
dead" or "You are dead", depending on whether the game is in the first
or second person. (This doesn't have to represent the actual death of
the player character in the game universe; for a notable
counterexample, this will usually be the command you use to tell the
player when they win the game.)

<code>open <i>room direction room</i></code>
: Add a new exit to the first room, in the specified direction, leading
to the second room. The direction will usually be one of the 'regular'
compass directions, but it can be anything. If the room already has an
exit in that direction, the room that it leads to is changed to the
one specified here (if different).


<code>close <i>room direction</i></code>
: Remove the exit from the specified room in the specified direction.
If the room does not have an exit in that direction, this has no effect.


<code>status <i>string</i></code>
: Sets the contents of the status bar at the top of the game window. If
this contains a vertical line character (`|`), the content to the left
of the vertical line will be displayed on the left of the status bar,
and the content to the right of the vertical line (if any) will be
displayed on the right of the status bar. If there is no vertical bar,
the whole text will be displayed on the right. The string may include
braced expressions, in which case the status bar will keep updating to
reflect any relevant variable changes. (If you want to print a vertical
line in the status bar, use the HTML entity `&verbar;`.)

<code>pick <i>variable lister</i></code>
: A lister is a kind of keyword that generates a list from its
own arguments (which must be included after the lister). Listers
will be explained below. This command picks one of the
values in the list and assigns that value to the variable.

<code>count <i>variable lister</i></code>
: Count the values in the list and assign that numeric value to
the variable.


<code>run <i>procedure</i></code>
: Run the specified procedure (which must be defined elswhere by
at least one `proc` block.) It does not matter whether the
procedure succeeds or fails.

<code>log <i>words...</i></code>
: Print the words (there can be any number of them) to the
Gruescript console. This is intended as a debugging aid and has
no help during gameplay. In an exported game, the words will be
logged to the JavaScript browser console. Note that the argument
is *not& a string, so it cannot contain braced expressions, but
any or all of the words may be variable or property references
(see below.)

If, after a command and on the same line, there is a colon (`:`)
followed by a string, that string will be printed after the
command is run. (You cannot use a 'raw' colon in a string
supplied to a command, such as `say` -- if you want Gruescript to
output a colon, use the HTML entity `&colon;`.) The message
is always printed, regardless of whether the command had any
effect. Like other strings, it can contain arbitrary HTML
(avoiding colons!) and braced expressions, which we will get to
later in this chapter.

#### Listers

The listers, with their own arguments, are:

`carried`
: Every item that the player is carrying.

`things`
: Every thing in the game.

`rooms`
: Every room in the game.

<code>tagged <i>tag</i></code>
: Every thing or room with the specified tag.

`here`
: Every thing in the player's current room (not counting things
that are carried by the player).

`inscope`
: Every thing in scope (i.e. in the player's room or carried by
the player).

<code>in <i>room</i></code>
: Every thing in the specified room.

`these`
: Any number of values can be specified. The iteration list
contains each of the specified values (you can include the same
value more than once, if you like.)

So, for some examples of commands using listers:

	pick beatle these john paul george ringo

will assign one of those names (they might be thing names, or room
names, or just words) to the variable `beatle`.

	count inventory_weight carried

will assign the number of things the player is carrying to
`inventory_weight`.

### Assertions

The Gruescript assertions, with their arguments, are:

<code>carried <i>thing</i></code>
: The thing is in the player's inventory (whether held, worn,
or neither.)

<code>held <i>thing</i></code>
: The player is holding the thing.

<code>here <i>thing</i></code>
: The thing is in the same room as the player (but not carried).

<code>inscope <i>thing</i></code>
: The thing is 'in scope' -- that is, either in the same room as
the player, or the player is carrying it.

<code>visible <i>thing</i></code>
: The thing is in scope, as above, and the player can see (i.e.
the special variable `cantsee` is zero).

<code>at <i>room</i></code>
: The player is in the specified room

<code>thingat <i>thing room</i></code>
: The specified thing is in the specified room, regardless of
whether it is carried.

<code>near <i>thing thing</i></code>
: The two specified things are in the same room, regardless of
whether either or both of them are carried.

<code>has <i>thing/room tag</i></code>
: The specified thing or room has the specified tag in its tag
list.

<code>hasany <i>thing/room tag...</i></code>
 : (`tag...` means that any number of tags may be listed.) The
specified thing or room has *at least one* of the listed tags.

<code>hasall <i>thing/room tag...</i></code>
: The specified thing or room has *all* of the specified tags.

<code>taghere <i>tag</i></code>
: The room that the player is in has the specified tag.

`cansee`
: The player can see; that is, the value of the special variable
`cantsee` is zero. (Remember that this is the same as that
variable having never been set.) This is *not* related to whether
the room the player is in is dark.

<code>is <i>variable string</i></code>
: The value of the specified variable is equal to the specified
string.

<code>contains <i>value lister</i></code>
: The list includes the value. This uses the same listers, with
the same arguments, as the `pick` and `count` commands (above).

<code>eq <i>value value</i></code>
: The two values are equal. This assertion, like its friends `gt`
and `lt`, is only useful if one of the values is supplied by
referencing a variable with `$` (see below).

<code>gt <i>number number</i></code>
: The first number is **g**reater **t**han the second.

<code>lt <i>number number</i></code>
: The first number is **l**ess **t**han the second.

<code>isthing <i>value</i></code>
: The value is the internal name of a thing.

<code>isroom <i>value</i></code>
: The value is the internal name of a room.

`continue`
: This assertion *always* 'fails'. The point is that you can use
this in a `verb`, `setverb` or `proc` block to ensure that
Gruescript 'continues' to the next matching block -- see the
chapters on verbs, and procedures and rules.

<code>try <i>procedure</i></code>
: Run the specified procedure and see if it succeeds. This is
like the command run except that it is an assertion. It succeeds
if the procedure succeeds, or fails if the procedure fails.


<code>js <i>string</i></code>
: Evaluate and run the string as JavaScript. Convert its return
value to a boolean, and pass the assertion if the boolean is
This is cheating. Please do not use it.

Any assertion can be prefixed with an exclamation mark (`!`) to
make it the *opposite* assertion. For example,

	!here magnet

passes if the magnet is *not* in the same room as the player.

Like commands, assertions can optionally be followed by a colon
(`:`) and a string. In this case, the message is only printed
if the assertion *fails*.

After commands and assertions, the third group of commands is the
**iterators**. Before we get to those, it will be usful to
know how to reference variables and properties, so we'll come
back to iterators later in this chapter.

### Referencing variables

Any argument given to an instruction may be a *reference* to a
variable (except string arguments; to supply variables as
strings you need to use a braced expression -- see below.) In
which case the value of that variable is supplied as the
argument. This is done by using the variable name prefixed with
a dollar sign (`$`). So

	gt $temperature 20: It's too cold!

passes if the value of the variable `temperature` is greater
than 20 (otherwise, it fails and prints the message.)

Note that instructions with arguments that *are* variables, like
`assign` and `is`, take the name of the variable *without* the $.
If you try something like

	assign $foo 10 # DO NOT DO THIS

you will store the value 10 in a variable *whose name is the
current value of the variable* `foo`, which is perverse but not
illegal.

### Referencing properties

Properties of things or rooms can be referenced, similarly to
variables. The reference is made using two words connected with
a single dot (`.`) (and no space) between them. The first word
is the internal name of the thing or room; the second is the
name of the property. The value of the property will be passed
as an argument to the command. For example, if the thing `bicycle` has the property `model` with
the value `Pedersen`, `bicycle.model` will evaluate to
`Pedersen`.

A dollar sign is not used to reference a property, but the
word on either or both sides of the dot can be variable
references themselves, notated as usual with the dollar sign
prefix (`$`). So if the variable `vehicle` contains the word
`bicycle`, then `$vehicle.model` will again evaluate to
`Pedersen`. With the appropriate variables set up, you could
also use `bicycle.$info` or even `$vehicle.$info`.

It is not an error to reference a nonexistent property of an
existent thing or room. Like variables, properties are
considered to have a numeric value of zero if they have not
been initiated. It *is* an error to attempt to reference any
property of a nonexistent thing or room -- in the above
example, if the variable `vehicle` had never been given a
value, or currently had a value that was not the internal name
of a thing or room, `$vehicle.model` would cause an error.

#### Referencing connected rooms

Similarly to referencing properties, you can reference a room's
connections by direction. If the kitchen is west of the
scullery, then `scullery.dir.west` will evaluate to `kitchen`.
Either the room or the direction, or both, can be a variable
reference, so with the appropriate variables you could use
`scullery.dir.$whichway`, or `$room.dir.out`, or
`$smell_origin.dir.$wind_direction`.

### Braced expressions

In any string argument, such as the arguments of the commands
`say`, `write` and `status`, variables can be embedded using
**braced expressions** -- expressions contained between curly
braces (`{`, `}`). There can be any number of these in a
string. They cannot be nested directly, but they *can* contain
references to variables or properties whose values include
braced expressions of their own. If you want to output curly
braces, use the HTML entities `&lcub;` and `&rcub;`.

Braced expressions consist of one or two words between the
braces. The 'principal word' of the braced expression can be
any literal word or (more usefully) a reference to a variable
or property. The principal word appears either on its own, or
with another word *before* it, which must be an **article**
(`a`, `an`, `the` or `your`) or a **pronoun reference**
(`nom`, `obj`, `pos`, `ind` or `ref`).

If the principal word in the expression is the *internal name* of
a thing, or is a reference to a variable or property whose
value is the internal name of a thing, the expression will
evaluate to the *screen name* of the thing. (This only happens
with variables referenced from within braced expressions in
strings; it does not happen to variable references in other
contexts.) So, if you have a thing like

	thing boss_2 name Droxar the Mighty

and a variable `npc` whose value is `boss_2`, then the
instruction

	say { $npc } leaps out of the shadows!

will refer to Droxar the Mighty by that name.

If the braced expression is prefixed by an article (`the`,
`a`, `an` or `your`, appearing inside the braces *before* the
principal word and separated from it by a space), the principal
word will be prefixed with the appropriate version of that
article: if the principal world is (or is a reference to) a
thing with a `def` or `indef` property, that value will be used
if appropriate; otherwise 'a' will be changed to 'an' if the
screen name begins with a vowel (or 'an' to 'a' if it doesn't
-- 'an' behaves exactly the same as 'a' but can be used for
capitalisation, as explained below), or 'some' for plural
things or mass nouns; 'your' will be changed to 'my' if the game is in 
first person; and the article will be omitted entirely if the
principal word is (or references) a thing with the `proper_name` tag.

If the prefix is a pronoun reference, a pronoun will be used
instead of the thing's name. If the thing has that pronoun
specified in its `thing` block, the appropriate one of those will
be used. Otherwise, the default choice of pronoun depends on
the thing's gender and/or plurality (i.e. whether it has any of
the `male`, `female`, `nonbinary` or `plural` tags; if none are
present, the thing is assumed to be singular and neuter, i.e.
'it'). In addition to the English pronoun cases, Gruescript adds
a few special references for common constructs and contractions,
like "it has" or "they're".

The pronoun references are:


| Ref | Case                   | Pronouns (neuter, male, female, nb, plural)      |
| --- | ---------------------- | ------------------------------------------------ |
| `nom` | nominative             | it, he, she, they, they                          |
| `obj` | objective              | it, him, her, them, them                         |
| `pos` | possessive             | its, his, her, their, their                              |
| `ind` | independent possessive | its, his, hers, theirs, theirs                   |
| `ref` | reflexive              | itself, himself, herself, themself\*, theirselves  |
| `nom_is` | nominative + is/are | it is, he is, she is, they are, they are |
| `noms` | nominative + is/are (abbreviated) | it's, he's, she's, they're, they're |
| `nom_have` | nominative + has/have | it has, he has, she has, they have, they have |
| `nomve` | nominative + has/have (abbreviated) | it's, he's, she's, they've, they've |

<sub>\* I ran a thoroughly non-rigorous twitter straw poll asking
nonbinary folk what they preferred for this; most chose
'themself', but 'themselves' was a significant minority. To
give a nonbinary character 'themselves', you can use plural
(maybe temporarily), or give everyone a custom ref_pronoun
property and reference that, or otherwise hack around the
issue.</sub>

So, the command

	hide $victim: You sneak up on {the $victim} and push {obj $victim} into the volcano.

will remove the thing referred to by the value of `victim` from
the game, and then might output

	You sneak up on the policeman and push him into the volcano.

or

	You sneak up on Geraldine and push her into the volcano.

or even (using a `def` property)

	You sneak up on all your friends and push them into the volcano.

depending on the value of the variable `victim` and the tags of
the thing that its value points to.

Second-person pronoun references (the word `you` and its relatives) are
handled specially in braced expressions. If a second-person pronoun
reference appears in a braced expression (and does not match a variable
or thing name) it will refer to the player, changing to first person if
the game has `person 1`. These are the only pronoun references that can
(and must) appear between the braces on their own, without a principal
word. The second-person pronoun references are:

| Ref | Case | First person | Second person |
| --- | ---- | ------------- | ------------- |
| `you` | nominative | I | you |
| `youm` | objective | me | you |
| `your` | possessive | my | your |
| `yours` | independent possessive | mine | yours |
| `yourself` | reflexive | myself | yourself |
| `you_are` | nominative + am/are | I am | you are |
| `youre` | nominative + am/are (abbreviated) | I'm | you're |
| `you_have` | nominative + have | I have | you have |
| `youve` | nominative + have (abbreviated) | I've | you've |

As the player's pronouns generally don't change during play, these are 
mostly useful in localisation of default messages (see the appendix on 
localisation). These can be capitalised in the same way as other pronou
references.

When a braced expression is written as part of a string into a
variable, property, tag description or the status line, the
expression itself *remains as a braced expression in the string*
and will be evaluated whenever it is output (either by a
command like `say` or by being displayed on a button, in a
visible tag, or the status line). If you want to keep the
string as it is now, use the `freeze` command:

	verb eat
	write snack_memory The last meal you ate was a lovely {$this}.
	freeze snack_memory
	hide $this

(note that `freeze`'s first argument is a variable, so it's
`freeze snack_memory`, *not* `$snack_memory`!) will evaluate
the braced expression in `snack_memory` *now* and rewrite that
into the same variable, so `snack_memory` will always display
the same, regardless of how often the value of `this` changes.

#### Capitalisation in references

If a variable or property has a lowercase name, such as `foo`,
it is possible to refer to that variable with a different
capitalisation -- `$Foo` or `$FOO` -- to get the contents of
that variable in Capitalised or UPPERCASE form (unless another
variable with the capitalised version of the name exists.) If
you do this with a property, you should capitalise the
`property` name, not the thing or room before it, e.g.
`banana.Ripeness` or `$fruit.COLOUR`. If the reference is
inside a braced expression, and the contents of the variable or
property are the internal name of a thing (and that thing's
internal name is lowercase), the result will be a capitalised
or uppercase version of its *screen name*.

This can also be applied to articles and pronoun references in
braced expressions. If an article is UPPERCASED, it will
uppercase the name of the thing along with it (regardless of
the capitalisation of the variable reference). So if the
variable `fruit` contains `apple`, and the `property` colour
of the apple is `red`:

	say {The $fruit} is {$fruit.COLOUR}.

will print

	The apple is RED.

and

	say {THE $fruit} is {$fruit.Colour}.

(or the same line with `$Fruit` or `$FRUIT`) will print

	THE APPLE is Red.

If you want to use uppercase with an indefinite article, `A` is
not long enough to be unambiguous (Gruescript will guess that
you mean to capitalise the article only), so use `AN` -- it
will obey the same rules as `a` with respect to vowels, proper
names, plurals and `indef`, so

	assign fruit banana
	say IT LOOKS LIKE {AN $fruit}!

will print

	IT LOOKS LIKE A BANANA!

## Iterators

**Iterators** are commands that change the 'flow' of a block
of instructions. When Gruescript finds an iterator, it will
consider the rest of the instructions in the current block
(that is, the `game`, `verb`, `setverb`, `proc` or `rule`
*block* that is currently being executed) to "belong to" this
iterator. (Instructions in other blocks with the same verb,
setverb or procedure name do *not* belong to it.)

It will then 'iterate' those instructions, running through them
one or more times. The iterated instructions can be commands,
assertions, or even more iterators (in which case that iterator
will, in turn, cause the code after it to be iterated once or
more, every time *that* iterator is called by its 'parent'
iterator, and so on.)

The instructions below the iterator are treated like a 'nested'
block of instructions: upon each iteration, they will be run in
turn until they are all complete, in which case that
iteration succeeds, or until any assertion fails, in which case
that iteration fails. Iterators are a special kind of
assertion, as they are considered to succeed or fail themselves
after they are done iterating. Note that a particular
`iteration` failing does not necessarily mean the `iterator`
running it will fail.

Gruescript has three iterators. An iterator is always followed
by a lister, which creates its `iteration list` of things,
rooms or values. The listers are the same as the ones used by
the `pick`, `count` and `includes` instructions, with the same
arguments (see above). The iterators are:

`all`
: The iterator will iterate (run its instructions) once each
for every item in the iteration list. It does not matter
whether any iteration succeeds or fails. The iterator itself
always succeeds.

`sequence`
: The iterator will iterate for each item on the iteration list
in turn, `until an iteration fails.` If all the iterations
succeed, the iterator itself succeeds. If any one iteration
fails, the iterator stops and fails itself.

`select`
: The iterator will iterate for each item on the iteration list
in turn, `until an iteration succeeds`. If all the iterations
fail, the iterator itself fails. If any one iteration succeeds,
the iterator stops and succeeds itself.

During each iteration, the special variable `this` will
contain the current item in the iteration list. (If `this`
already had a value, it will be reset to its previous value
when the iterator completes, making it safe to 'nest' iterators
or to call procedures that contain their own iterators.)

For example, the following iterator looks through all the
things in the room `meadow`, and causes a hungry to eat all of
them, without condition:

	all in meadow
	say The hungry goat eats {the $this}!
	hide $this

If we wanted to change the goat's behaviour so that it is a
little more discerning, and only eats things with the tag
`edible`, we can simply add an assertion to the block:

	all in meadow
	has $this edible # if this assertion fails, proceed to next iteration. Otherwise...
	say The hungry goat eats {the $this}!

Or, if we want it to eat a maximum of one thing, we could use
`select`:

	select in meadow
	has $this edible # otherwise fail this iteration
	say The hungry goat eats {the $this}! # the iteration
succeeds, so the sequence stops and succeeds

On the other hand, if we want the goat to eat everything
available for as long as it can, until it attempts to eat
something that is *not* edible, we could use a `sequence`:

	sequence in meadow
	say The hungry goat eats {the $this}
	!has $this edible: Oh dear, it looks ill.
	# Otherwise, the sequence is still going!
	say It licks its lips and looks for more food.

As an iterator itself an assertion, the block it belongs to
will fail if the iterator does. It can be prefixed with `!` to
make it the opposite assertion (this does not affect how the
iteration itself or the instructions below it behave), and it
can be postfixed with `:` followed by a string that will be
printed if the assertion fails -- that is, if the whole
*iterator* fails. The message will appear in its own paragraph,
after any output from the iterated instructions.

## Verbs

Verbs are the basic unit of interaction in Gruescript games. The
player can always see, in the 'room' window, the directions and verbs
available to them.

`verb` blocks contain the instructions to be run when the player
clicks a particular verb. Verbs blocks can be defined in two ways:
specific to an object (**specific verb blocks**), or without an object
(**general verbs blocks**). When the player clicks on a verb next to
an object, Gruescript will first look for specific verb blocks
definitions matching that verb for that object, and then for general
definitions of the verb. Gruescript then goes through each of those
definitions in turn, running their instructions,  until any one block
*succeeds*. Specific verb blocks are always processed before general
verb blocks.

In addition to any author-defined verbs, there are six **native verbs**:
`take`, `drop`, `examine`, `wear`,  `remove`, and `wait`. The
behaviour of these verbs, and what things they are active for
under what circumstances, is handled by gruescript. You can write
your own `verb` blocks for these -- and often will, for example if
you want to 'override' `take` for a certain item in order to stop
the player picking it up without meeting some requirement. These
verbs' 'native' behaviour is always considered *after* any
author-defined verb blocks (and always 'succeeds'), so if you make
a block for one of these verbs, and it succeeds, the verb's native
behaviour will not be executed.

Here's an example of a thing, and a specific verb that works with
it:

	thing guitar
	has portable
	cverbs play

	verb play guitar
	say It goes TWANG!

As `play` is listed in the guitar's cverbs, the player will see a
'play' button listed next to the guitar whenever it is carried. In
this case, the effect of playing the guitar is simple: it prints a
message.

Suppose we wanted to define 'play' in a more general way.

	thing guitar
	has portable instrument
	cverbs play

	thing piano
	has instrument
	verbs play

	verb play
	say You extract a strange sound from {the $this}!

Now the guitar and the piano both have the verb `play` (in the
guitar's case, only when it is carried) but, because there is no
specific verb block for either `play guitar` or `play piano`, The
general verb block for `play` is used.

While a verb's instructions are being executed, the special variable
`this` always contains the object of the verb -- that is, the noun
that the player has clicked a button next to. So the `say`
instruction in the general `play` block will refer to either the
guitar or the piano, whichever is being played.

If Gruescript finds multiple verb blocks that match the player's
command, it will run through them all (general first, then specific)
until one succeeds, then stop.

This means we can do something like this:

	verb play piano
	set noise plink plonk
	continue

	verb play guitar
	set noise kraang
	continue

	verb play
	say It makes a noise like "{$noise}"!

### Verbs with directions

Verbs can be used to interfere with player movement, such as to make
an exit from a room impossible until a certain condition is met. For
this purpose, the verb is considered to be `go`. The direction
is treated as the object of the verb. It is put into the variable
`direction`, *not* `this`.

As with any verb blocks, if a block succeeds, the execution of the
verb stops. So, to block an exit, you need to create a verb block
that succeeds. This can be used to block a particular exit:

	verb go in
	at $outside_nightclub
	here bouncer
	say The bouncer won't let you in.

or a particular direction:

	verb go
	eq $direction east
	say The wind from that direction is too strong to walk against.

or to stop movement entirely:

	verb go
	hasall shoes gluey worn
	say Your shoes are glued to the floor!

If you want to allow the travel, use `continue` to make the
block fail:

	verb go west
	at ocean_beach
	say You dive into the sea and swim west...
	assign swimming 1
	continue

Or you can mess with the action entirely:

	verb go
	eq $lost 1
	taghere outside
	say You wander around the city at random...
	random lostwalk 3
	continue

	verb go
	eq $lost 1
	eq $lostwalk 1
	goto park

	verb go
	eq $lost 1
	eq $lostwalk 2
	goto graveyard

	verb go
	eq $lost 1
	eq $lostwalk 3
	goto abandoned_building

### Setverbs

Setverbs are crucial to Gruescript's keyboardless interface -- they
tell Gruescript when to activate or de-activate particular verbs for
particular things. They look very similar to verbs -- in fact, apart
from beginning with `setverb` instead of verb, their syntax is
identical. However, *setverbs should not contain commands*, only
assertions, and they should not print messages. Using a command in a
setverb, or printing a message after a failed assertion using `:`, is
not actually an error, but it can have highly odd results, since it is
not easy to predict when these instructions will be run. Gruescript
will check setverbs at least once every turn, and also every time the
player changes the inventory item they are 'holding' -- but on most of
these occasions, not all setverb blocks will actually run. This is
because once *any* successful setverb block has determined that a
certain verb is to be active for a certain thing, no other setverbs
will be checked *for that thing-verb pair.*

Like verb blocks, setverb blocks can be **specific** or **general**,
depending on whether they specify a thing in the first line. A specific
setverb block can only ever activate a particular verb for a
particular thing; a general setverb block will consider *every* thing
that is 'in scope' (i.e. carried by the player, or in the room).
When a general setverb block is being considered, the special
contextual variable `this` will contain whatever thing is currently
being considered. So

	setverb cook
	hasall $this food raw
	here oven

means that any thing with both the `food` and `raw` tags will have the
verb `cook` active if the oven is in the player's current room. (Since
verbs are only ever visible for items that are in the player's room, or
being held, we do not need to check whether $this is actually
present.)

Specific setverbs come with a noun:

	setverb cook tomato
	here special_tomato_oven

Setverb blocks can also be **intransitive**. Intransitive setverb
blocks look like specific setverb blocks, but they use the
pseudo-object `intransitive.`  If an instransitive `setverb` block
succeeds, its verb will be available to the player but not tied to a
particular thing. The verb button will be displayed at the top of the
room description (below the description itself, but above the room
contents), in an "Actions:" line. For example

	setverb fly intransitive
	has cape worn

will make the 'fly' verb available anywhere.

Blocks of similar setverbs, like verbs, run until one of them succeeds
-- that is, if any setverb succeeds for a given verb and a given thing
(regardless of whether it is a specific or general setverb), no further
setverbs will consider that verb and thing together. So if our
Gruescript contains the `setverb cook` example above, it will *never*
be possible to deactivate the cook verb for any thing with the `food`
and `raw` tags if the oven is present. Any exceptions must be accounted
for in the same setverb block, or dealt with another way. It
can be helpful to use rules (see the next chapter) to change a
variable, and write a single setverb block that depends on the value of
that variable.

Setverbs have no 'memory' -- to keep a verb active for a thing, the
relevant setverb block(s) must pass continually. Whenever setverbs are
checked, all verbs are deactivated for all things unless a setverb
turns them on. The only exceptions are the native verbs `take`, `drop`,
`wear` and `remove`, which are set depending on context, and the native
verb `examine`, which is always considered active for all things
(although it is performed by clicking the noun, rather than the verb)
if your game has `examine on`.

## Conversation

Everything in this chapter only applies if your game uses Gruescript's
conversation system -- that is, if your `game` block contains the line:

	conversation on

If this line is not present, or is `conversation off`, you can ignore
this chapter and are free to implement dialogue however you wish, or
not at all.

The conversation system allows you to create more complex dialogue in 
your game by switching to a more choice-based system when the player is
talking toa non-player character (NPC). While a conversation is going
on, a newpane appears in the interface, between the scroller and 
room description. This specifies who or what the player is talking 
to, and contains up to three lists of 'topics' -- essentially, a 
special kind of verb -- that the player can "ask", "tell" or "say". 
Finally, there is a button to end the conversation.

For the purpose of the conversation system, an NPC is any thing with
the tag `conversation`. It is likely (but not necessary) that you will
also want to give it the tag `alive`, and one of `male`, `female` or
`nonbinary` to set its pronouns. An example:

	thing mrs_ft Mrs Fothertonhayes-Cranstanley
	name mrs fothertonhayes-thomas
	loc pta_meeting
	tags alive female conversation
	prop start_conversation "How may I help you?" asks \
	    Mrs Fothertonhayes-Cranstanley, looking down her nose at you.
	prop end_conversation Mrs Fothertonhayes-Cranstanley gives you
	    a curt nod.

The special properties `start_conversation` and `end_conversation`
contain strings that will be printed when the player starts or ends
a conversation with this NPC. If they are not present, default
messages are used: "You start talking to *(NPC)*." or "You stop
talking to *(NPC)*." (or their first-person equivalents, in a game
with `person 1`.)

When the player 'talks' to Mrs Fothertonhayes-Cranstanley, they will
see something like:

	Talking to: Mrs Fothertonhayes-Cranstanley
	Ask about: \[history\] \[geography\]
	Tell about: \[husband\] \[burglary\]
	Say: \[club password\]
	\[end conversation\]

The "end conversation" verb will hide the conversation panel. It
will also disappear if the NPC that the player was talking to is no
longer in scope, either because the player walked to another room
or the NPC was moved somewhere else, or if the player begin another
conversation by talking to a different NPC. If the conversation ends
by any means other than the player clicking "end conversation", the
NPC's `end_conversation` message will *not* be printed.

During the conversation, the room description and inventory are
visible as normal, and the player can continue to use whatever other
verbs are available in the room. The special variable `conversation`
will contain the internal name of the NPC. If you want to force the
conversation to end without removing the NPC,

	assign conversation 0

will do so.

You are free to treat `talk` as an ordinary verb, including 
'overriding' it with specific or general verb blocks (the object is 
the NPC), or adding it with a setverb to other things, such as simple 
NPCs that you don't want to make a complex conversation tree for (just
leave out the `conversation` tag.)

Asks, tells and says are defined by setverb and verb blocks, the 
same as ordinary verbs. The 'object' of ask, tell or say is considered
to be the *conversation topic*, which can be a thing name or any
arbitrary value. You can change the display of these 'verbs' with
`display` and `prompt`, and do anything else that you can do in
ordinary `verb` and `setverb` blocks.

Regardless of setverbs, "ask", "say" and "tell" will *only* be
considered for activation when a conversation is open. They will 
never be tied to particular things. So,

	setverb ask alibi

will mean you can "ask about alibi" when talking to *any* NPC, and
you do not need to worry about the verb becoming active for other
things.

To make asks, tells or says that are specific to a particular
NPC, use verbs that *begin with* `ask_`, `tell_` or `say_` (with an
underscore), followed by the NPC. So:

	setverb ask_mrs_ft hat

will make "hat" an available 'ask' topic for
Mrs Fothertonhayes-Cranstanley, and nobody else, whether or not the
hat is actually a thing. As usual, the setverb block can contain
instructions:

	setverb ask_mrs_ft hat
	has mrs_ft wearing_hat

will succeed, and activate the topic, only if she has the
`wearing_hat` tag.

Verb blocks can be made the same way. Any `ask_`, `tell_` or `say_`
verb blocks with an NPC will be considered before any `ask`, `tell`
or `say` blocks without, with execution stopping after a success
as usual, so

	verb ask_mrs_ft hat
	say "I inherited it from a particularly dreadful great-aunt,"
		she says. "Elegant, isn't it?"
	
	verb ask hat
	say "It makes her look like a tree," says {the $conversation}.

will print the first message when talking to
Mrs Fothertonhayes-Cranstanley, and the second message when talking to
anyone else. Any general `verb ask` blocks would be considered after
either of them.

General `setverb ask` or <code>setverb_ask_<i>topic</i></code> are 
also allowed:

	verb ask_fish_expert
	has $this fish

will activate "ask fish expert about" for every thing with the `fish`
tag, and

	verb ask
	has $this hot_topic

will make *any* thing with the `hot_topic` tag available as an ask 
for *everyone* with `conversation`. Note that in these cases, only 
'things' will be considered. If you want to do this other topics, 
create 'dummy' things.

By using variables, properties or tags in conversational verbs and 
setverbs, it is possible to create quite complex conversation trees.

## Procedures and rules

### Procedures

**Procedures** are made of `proc` blocks, which consist of a name and
a group of instructions. A simple example:

	proc do_cat
	bring cat
	say The cat appears and meows at you.

This can then be 'called' by its name, either with the command

	run do_cat

or the assertion

	try do_cat

This can be anywhere that instructions are allowed -- a verb block,
a setverb block, a rule, the `game` block, or another procedure. A
procedure can even call itself (although if it does, you should take
care to avoid infinite loops.)

The difference between `run` and `try` is that `run` is a command and
`try` is an assertion. `run` will always just run the procedure, and
then the next instruction after the `run` (if any) will be executed.
`try` will succeed or fail depending on whether the procedure succeeds
or fails; like any assertion, if `try` fails, the block (or iteration)
that contains it will also stop running and fail.

There can be several `proc` blocks with the same name. In this case,
when that name is called by `run` or `try`, the blocks will be run one
after the other, in the order that they appear in your Gruescript
source, until one of them fails. (Even when called from `run`, a
procedure block can fail and stop this execution; the only difference
is that `run` *itself* is not an assertion and cannot fail.) `try` will
succeed if *all* the procedure blocks of the specified name succeed, or
fail as soon as *any one* of those blocks fails.

A note for programmers: Gruescript has no concept of 'scope', except
for the contextual variable `this` in iterators. Assigning or changing
a variable in one procedure block will change it for everything else as
well.

### Rules

**Rules** are 'anonymous' procedures that run every turn,  beginning
at the end of the player's first turn. They are like procedures, but
have no name; their first line consists of the word `rule` on its own.


Each `rule` block runs its instructions until they are complete or one
of its assertions fails, and then execution passes to the next `rule`
block in the code (if any). Whether a rule block fails or not makes no
difference, except to where that block stops running. Because no one
`rule` blocks ever prevents another from running, there is no
important distinction between a 'rule' and a `rule` block.

Rules run in the order that they are declared in the Gruescript
source.

## More about variables and tags

### Special variables

Gruescript keeps track of the following special variables. Unless noted
otherwise, you should only use them for reading and not writing --
writing is not illegal, but will have unpredictable results. Generally
there is a right way to change things; for example, rather than
`assign room laboratory`, you probably want `goto laboratory`.

`verb`
: The internal name of the last verb used by the player. If they moved
in a direction, this is `go`.

`thing`
: The internal name of the object of the last (non-intransitive) verb
used by the player, i.e. the thing that they clicked a verb next to
(or, for `examine`, the thing whose name they clicked on.)

`this`
: The thing currently being considered by a verb or setverb. When used
in a verb block,  this will always have the same value as `thing`.
When used in a setverb block, it is the thing Gruescript is currently
considering activating the verb for -- its value is unpredictable, but
it will stay the same on any one run through any one setverb block
(except below an iterator). In an instruction belonging to an iterator,
`this` contains the current item being considered by the iterator.

`direction`
: The last direction travelled, or the direction currently being
travelled, by the player.

`held`
: The thing the player is currently holding. If they are not holding
anything, this has a numeric value of zero.

`room`
: The room that the player is currently standing in.

`conversation`
: If your game has `conversation on`, this variable contains the
internal name of the thing the player is currently talking to, if any.
If there is no conversation going on, its value will be zero.

`cantsee`
: If this value is zero, the player can see. If it is 1 (or anything
else) they cannot. Remember that a value of zero is the same as having
never been set. The player being innately unable to see is *not* the
same as the room being dark -- these two concepts are independent of
each other. This variable should be used for things like being
temporarily dazzled or wearing a blindfold. Unlike the other special
variables, it is safe to write to cantsee  -- in fact, the correct way
to change its value is to do so.  (The assertion `cansee` exists as
shorthand for `eq $cantsee 0`)

`score`, `maxscore`
: By default, the value of these variable will be shown as <code><i>
score</i>/<i>maxscore</i></code>  (e.g. "0/5") at the right of the
status bar. If the value of `maxscore` is zero, only `score` will
be shown. This can be overridden by the status` command.

`maxinv`
: The maximum number of items the player is allowed to carry at once
via the `take` verb If this is zero (as per the default behaviour), there
is no limit. Other ways of adding things to inventory, like `give`, do
*not* respect this limit. (This is included mainly for historical reasons;
inventory limits have been Frowned Upon in IF design for many years.)

### Visible tags

Tags can be made 'visible' by using a `tagdesc` block. This is a single
line consisting of the keyword `tagdesc`, followed by the name of the
tag, and then a string that will be printed, in parentheses (like this),
after the thing when it appears in a room description or the player's
inventory. If the string is omitted, the name of the tag is used, with
underscores replaced by spaces. This can be done with special tags like
`lightsource`; it adds the printed message but does not affect the
behaviour of the tag. Examples:

	tagdesc bargain labelled "half price"
	tagdesc lightsource providing light
	tagdesc broken

Tags for rooms are never visible (change the room's `desc` property
instead.)

## Appendix I: Visual configuration

The `game` block may contain `colour` lines which determine the colours
used by the game. You can spell it  `color` if you like. These
lines take the form
<pre>
	colour <i>colour-area HEXCODE</i></u>
</pre>

where <code><i>colour-area</i></code> is one of the below:

	statusbar_background       conversation_text
	statusbar_text             conversation_button
	main_background            conversation_button_text
	main_text                  examine_button
	main_prompt                examine_button_text
	main_text_old              inventory_background
	main_prompt_old            inventory_text
	instructions_button        inventory_button
	instructions_button_text   inventory_button_text
	room_background            inventory_inactive_text
	room_text                  save_background
	room_button                save_button
	room_button_text           save_button_text
	conversation_background    page_background

Most of these are (hopefully) self-explanatory. Note that the
`save_...` colour-areas apply to the part of the page containing the
'save', 'restore', 'restart' and 'undo' buttons, and all those buttons
(by default, the save area's background will be the same as
`page_background`). `inventory_inactive_text` usually applies only
to the button in your inventory that corresponds to the thing currently
`held` by the player. Messages in the scroller appear in the
`main_text` colour initially, then change to `main_text_old`
(usually a dimmer colour) on subsequent turns. `main_prompt`
and `main_prompt_old` apply to the mock 'command prompts' echoed in the
scroller.


<code><i>HEXCODE</i></code> is a three-or six-digit colour code. It
is *not* preceded by `#` -- that would make it a comment! It can also
be a css colour name like `red`.

For advanced visual configuration, you can apply whatever CSS you want
to your game's HTML page once you have downloaded it. You can also
change the layout of the page itself, as long as it keeps the `div`
elements that Gruescript uses: `topbar_left`, `topbar_right`,
`scroller` (containing `scroller_content`), `scroller` (containing `scroller_content`), `room_description`, `holding`, `inventory`,
`save_prompt`, `restart_prompt`, `save_load`, `saved_games` and
`options`.

## Appendix II: Localisation

The `game` block may contain localisation lines which replace the default English messages and button labels. These lines take the form:
<pre>
	localise <i>message-key string</i></u>
</pre>
You can spell the first word `localize` if you like. <i><code>
message-key</code></i> is one of the localisation keys listed below, and
the string is the message that will be printed in its place. The 
localisation keys, and the English default values, are:

| localisation key | default English value |
|----------|----------|
| `talking_to` | Talking to: |
| `ask_about` | Ask about: |
| `tell_about` | Tell about: |
| `say` | Say: |
| `its_dark` | It's dark. |
| `you_can_also_see` | `{You}` can also see: |
| `you_can_also_see_scroller` | `{You}` can also see |
| `youre_holding` | `{Youre}` holding: |
| `youre_carrying` | `{Youre}` carrying: |
| `youre_wearing` | `{Youre}` wearing: |
| `taken` | Taken. |
| `you_cant_carry_any_more` | `{You}` can't carry any more. |
| `dropped` | Dropped. |
| `exits` | Exits: |
| `you_cant_see` | `{You}` can't see! |
| `its_too_dark_to_see_clearly` | It's too dark to see clearly. |
| `{You_see_nothing_special_about_that | You}` see nothing special about `{`the` $this}`. |
| `ok_youre_wearing_it` | OK, `{youre}` wearing `{obj $this}`. |
| `ok_youve_taken_it_off` | OK, `{youve}` taken `{obj $this}` off. |
| `time_passes` | Time passes... |
| `you_start_talking_to` | `{You}` start talking to `{the $this}`. |
| `you_stop_talking_to` | `{You}` stop talking to `{the $this}`. |
| `you_are_dead` | `{You_are}` dead |
| `and` | and |
| `save_button` | save game |
| `restore_button` | restore game |
| `restart_button` | restart game |
| `undo` | undo |
| `cant_undo` | Can't undo, sorry |
| `undone` | Undone "`{$this}`" |
| `restart_prompt` | Really restart this game? |
| `restart_confirm` | Restart |
| `restart_cancel` | Continue |
| `save_prompt` | Save game as: |
| `save_confirm` | Save |
| `save_cancel` | Cancel |
| `options` | options |
| `credits` | credits |
| `font` | font |
| `font_size` | font_size |
| `print_room_title_in_scroller` | Print room title in scroller: |
| `list_objects_in_scroller` | List objects in scroller: |
| `options_title` | Display options |
| `options_always` | Always |
| `options_landscape_only` | Landscape only |
| `options_never` | Never |
| `options_done` | done |


## Appendix III: Cloak of Darkness

Roger Firth's *Cloak of Darkness* is a small game that has become a
sort of reverse Rosetta stone for interactive fiction authoring
systems: it is traditional to rewrite Cloak of Darkness in any new
authoring system, in order to give an overview of how that system deals
with common game elements.

The specification of the game is deliberately simple: the player begins
the game in the foyer of an opera house, wearing a cloak. There are two
other rooms, a cloakroom and a bar. Entering the bar, the player finds
that the room is dark; if they remove their cloak and (optionally)
hang it on a hook in the cloakroom and then go back to the bar, they
will find the bar is now lit. If they did not spend too long in the bar
while it was dark, they will now see a message written in the dust
telling them they have won the game; otherwise, they have scuffed out
the message, and lose.

A Gruescript version of Cloak of Darkness goes something like this...

	# Game metadata and global parameters
	game Cloak of Darkness
	id CLOD
	# The game ID is used to identify saved games in
	# browser storage. This should be different for
	# each of the Gruescript games on your site, so
	# they don’t interfere with each others’ saves.
	author Roger Firth, adapted to Gruescript by Robin Johnson
	version 0.0.1
	person 2 # "You are in..."
	examine off
	# custom status line. On the left, display the
	# player’s current room; on the right, whether
	# they are wearing the cloak – we’ll use a
	# variable called ‘cloaked’ for this.
	status { $Room | $cloaked }

	# a portable item, the cloak
	thing cloak pitch-black opera cloak
	carried # starts in inventory
	tags portable wearable worn
	# These are all special engine-recognised tags:

	# ‘portable’ means it can be picked up and
	# dropped; ‘wearable’ means it can be worn (if
	# carried) and removed (when worn); ‘worn’ means
	# the player is wearing it at the start of the game.

	# the ‘cloaked’ variable, which we are displaying
	# on the status bar, and a rule to set it
	var cloaked Cloaked # its initial value
	rule
	assign cloaked Cloaked
	!has cloak worn
	assign cloaked Uncloaked

	# rooms
	room foyer You're in the foyer of the Opera House.
	tags start # the player starts here
	# directions to other rooms
	south bar
	west cloakroom
	north foyer
	# ‘north foyer’ is a dummy direction, so that the
	# button appears: attempting to go north will be
	# caught by the following verb block:

	verb go north
	at foyer
	say But you've only just arrived!
	# This verb block always ‘succeeds’, effectively
	# blocking the action.

	room bar You're in the bar.
	north foyer
	tags dark # this room is dark

	# The bar should be dark unless the cloak is
	# elsewhere. Because a rule block will fail when
	# an assertion inside it fails, the easiest way to
	# do this in a single rule is to make the bar
	# dark, then “un-make it dark” if the conditions
	# are met.
	rule
	tag bar dark
	!thingat cloak bar # includes carried/worn
	# The ‘!’ prefix negates the assertion, so if the
	# cloak is NOT at the bar, the rule will continue:
	untag bar dark

	# If we are in the bar and it’s dark, increase the ‘mess’.
	# The player gets one warning.
	rule
	at bar
	has bar dark
	add mess 1
	!eq $mess 2: You should probably go back out to the foyer &ndash; \
	you wouldn't want to accidentally disturb anything in the dark.

	room cloakroom You're in a small cloakroom.
	east foyer

	# a non-portable item
	thing hook brass hook
	loc cloakroom

	# determine when to activate the verb ‘hang’.
	# In a parser game, the player would type
	# “hang cloak”, not “hang hook”. We’ll use
	# ‘display’ and ‘prompt’ to make the mock prompt
	# look like that, but we’ll actually attach the
	# verb to the hook, not the cloak.
	# This is a little more intuitive: you ‘hold’ the
	# cloak, and then look round the ‘room’ for
	# something to attach it to.

	setverb hang hook # when to activate 'hang' verb for the hook
	!eq $held 0 # check we’re holding *something*
	# (the contextual variable ‘held’ contains the
	# item being held, or 0 if none.)
	has $held wearable
	# *any* wearable garment(s) can be hung on the
	# hook. (There just happens to be only one in the
	# game.)

	verb hang
	display hang {$held}
	prompt hang {$held} on {$this}
	# we’ll use an author-defined tag, ‘hooked’, to
	# make something show if it’s currently hanging
	# on the hook. It doesn’t change any other
	# behaviour (you can still pick it back up
	# normally with ‘take’), so this is
	# straightforward.
	tag $held hooked
	say You hang {the $held} on {the $this}.
	put $held $this.loc

	# create a ‘visible tag’
	tagdesc hooked on hook

	# taking anything that is 'hooked' removes that
	# tag
	verb take
	untag $this hooked
	continue
	# ‘continue’ forces this verb block to fail, so
	# the native verb ‘take’ will pick it up

	thing dust dust (on floor)
	loc bar

	# The game ends when the player is in the bar and
	# the bar isn’t dark; whether they win or lose
	# depends on how much mess they’ve made in the
	# bar.
	rule
	at bar
	!has bar dark
	lt $mess 3
	say A message is scrawled in the dust! It reads&colon;
	die You win # end the game

	rule
	at bar
	!has bar dark
	# There is no need to check $mess here – if it is
	# less than three, the assertion in the above rule
	# would already have passed, and the game ended.
	say A message is scrawled in the dust!
	say What a pity, it's too scuffed to read.
	die You lose
