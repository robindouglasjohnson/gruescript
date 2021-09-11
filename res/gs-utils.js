/*
 * Gruescript utilities
 * by Robin Johnson
 * http://versificator.itch.io/gruescript
 *
 * This is for utilites of the online editor that do not go in the
 * exported game files (including the export function itself).
 *
 * released under the MIT Licence:
 
Copyright 2021 Robin Johnson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
 *
 */

/*** toggle light/dark view ***/
IS_DARK = true;
function toggleDark() {
	if(IS_DARK) {
		$('#editor').addClass('light');
		$('#toggleDarkButton').text('Light');
		IS_DARK = false;
	} else {
		$('#editor').removeClass('light');
		$('#toggleDarkButton').text('Dark');
		IS_DARK = true;
	}
}

/*********** files *********/
GRUESCRIPT_SAVED = true;
GSEDIT = null;
SYNTAX_DIV = null;
// load gruescript from a file into the editor pane
$(document).ready(function() {
	GSEDIT = document.getElementById('gsEdit');
	SYNTAX_DIV = document.getElementById('syntaxHighlighting');
	
	document.getElementById('chooseFile').onchange = function(){

	  var file = this.files[0];
	  
	  this.value=null; // so that 'change' will fire if the user reloads the same file

	  var reader = new FileReader();
	  reader.onload = function(progressEvent){
		
		GSEDIT.value = this.result;
		highlight();
		readGruescript();
		GRUESCRIPT_CHANGED = false;
		
	  };
	  reader.readAsText(file);
	};
	
	if(load_from_browser(true)) {
		gs_console('restored from previous session');
		buildGame(true);
	} else {
		loadExample("Cloak of Darkness");
	}
	
	GSEDIT.addEventListener('input', function() {
		highlight();
		GRUESCRIPT_CHANGED = true;
		GRUESCRIPT_SAVED = false;
	});

	GSEDIT.addEventListener('scroll', function() {
		syncScroll();
	});
	GSEDIT.addEventListener('change', function() {
		syncScroll();
	});
	GSEDIT.addEventListener('focus', function() {
		syncScroll();
	});
	GSEDIT.addEventListener('blur', function() {
		syncScroll();
	});
	GSEDIT.addEventListener('click', function() {
		syncScroll();
	});
	GSEDIT.addEventListener('mouseover', function() {
		syncScroll();
	});
	GSEDIT.addEventListener('mouseout', function() {
		syncScroll();
	});
	
	window.addEventListener('beforeunload', function(e) {
		if(!GRUESCRIPT_SAVED) {
			e.preventDefault();
			e.returnValue = '';
		}
	});
	
});
function syncScroll() {
	SYNTAX_DIV.scrollTop = GSEDIT.scrollTop;
	SYNTAX_DIV.scrollLeft = GSEDIT.scrollLeft;
}

DOING_HIGHLIGHTING = false;
CHANGES_TO_HIGHLIGHT = false;
WAITING_TO_HIGHLIGHT = 0;
HILITE_TIMEOUT = 100;
//HILITE_ROWS_EITHER_SIDE = 100;
MIN_LENGTH_TO_WORRY = 10000;
WORRYING = false;
function highlight() {
	syncScroll();
	if(!WORRYING && GSEDIT.value.length >= MIN_LENGTH_TO_WORRY) {
		WORRYING = true;
	}
	if(WORRYING && DOING_HIGHLIGHTING) {
		if(!GSEDIT.classList.contains('waiting')) {
			GSEDIT.classList += ' waiting';
		}
		CHANGES_TO_HIGHLIGHT = true;
	} else {
		// start highlighting
		DOING_HIGHLIGHTING = true;
		doHighlighting();
	}
}
function done_highlighting() {
	// ...but are we really?
	syncScroll();
	if(CHANGES_TO_HIGHLIGHT) {
		if(!WAITING_TO_HIGHLIGHT) {
			WAITING_TO_HIGHLIGHT = setTimeout(()=> {
				WAITING_TO_HIGHLIGHT = 0;
				CHANGES_TO_HIGHLIGHT = false;
				doHighlighting();
			}, 0);
		}
	} else {
		DOING_HIGHLIGHTING = false;
		$('#gsEdit').removeClass('waiting');
		WORRYING = GSEDIT.value.length >= MIN_LENGTH_TO_WORRY;
		clearTimeout(AUTOSAVE_TIMEOUT);
		AUTOSAVE_TIMEOUT = setTimeout(autosave, 1000);
	}
}

function doHighlighting() {

	var editorContent = GSEDIT.value;

	//var lines = SYNTAX_DIV.innerText.split('\n\n');
	
	var lines = [];
	var ln = 0;
	var editorLines = editorContent.split('\n');
	for(var i in editorLines) {
		++ln;
		
		var line = editorLines[i];
		/*
		if(ln < startHighlighting) {
			lines.push(line+'<br/>');
			continue;
		}
		if(ln > stopHighlighting) {
			break;
		}
		 */
		
		// & < and > will break the display
		line = line.replaceAll('&', '&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
		
		
		var hashIx = line.indexOf('#');
		var comment = '';
		if(hashIx>=0) {
			comment = '<span class="comment">' + line.substring(hashIx)+'</span>';
			line = line.substring(0,hashIx);
		}
		
		var colonIx = line.indexOf(':');
		var message = '';
		if(colonIx>=0) {
			message = ':<span class="string">' + line.substring(colonIx+1) + '</span>';
			line = line.substring(0, colonIx);
		}
		
		// instructions (& other things) with a string as their first argument
		line = line.replace(/(^\s*(say|die|js|game|author|prompt|display)\s+)(.*)$/g, '$1<span class="string">$3</span>');
		// instructions with a string as their second argument, and block names that include a printed message
		line = line.replace(/(^\s*(write|is|room|thing|tagdesc|sayat|localise|localize)\s+[a-zA-Z_]+\s+)(.*)$/g, '$1<span class="string">$3</span>');
		var str = '';
		var strIx = line.indexOf('<span class="string">');
		if(strIx>=0) {
			str = line.substring(strIx);
			line = line.substring(0,strIx);
		}
		
		// commands
		// todo: might save a few milliseconds if the words in these regexps were sorted by most common first
		line = line.replaceAll(/(^\s*)(run|hide|bring|give|carry|wear|unwear|unhold|put|putnear|goto|swap|tag|untag|tagroom|untagroom|assign|write|add|random|say|die|open|close|status|pick|count|isthing|isroom|log)(?=\s|$)/g,'$1<span class="command">$2</span>');
		// assertions
		line = line.replaceAll(/(^\s*)(!?(carried|held|here|inscope|visible|at|thingat|near|has|hasany|hasall|taghere|cansee|is|eq|gt|lt|contains|continue|try|js))(?=\s|$)/g,'$1<span class="assertion">$2</span>');
		// iterators
		line = line.replaceAll(/(^\s*)(!?(sequence|select|all))(?=\s|$)/g,'$1<span class="iterator">$2</span>');
		// block types
		line=line.replaceAll(/(^\s*)(game|room|exit|thing|rule|verb|setverb|proc|tagdesc|var)(?=\s|$)/g,'$1<span class="blocktype">$2</span>');
		
		// special tags, variables and property names, and iterator lists
		line=line.replaceAll(/\s(things|rooms|carried|in|tagged|these|here|inscope|start|dark|portable|wearable|worn|alive|lightsource|plural|indef|def|male|female|nonbinary|list_last|quiet|on|off|score|maxscore|intransitive)(?=\s|$)/g,' <span class="specialtag">$1</span>');

		// properties and directions
		line=line.replaceAll(/(^\s*)(prop|name|desc|north|northeast|east|southeast|south|southwest|west|northwest|up|down|in|out|fore|aft|port|starboard|id|author|version|person|examine|conversation|show_title|instructions|wait|tags|dir|loc|verbs|cverbs|display|prompt|pronoun|localise|localize|color|colour)(?=\s|$)/g,'$1<span class="prop">$2</span>');

		// variables and numbers
		line = line.replaceAll(/\s(\$[a-zA-Z_]+)(?=\s|$)/g,' <span class="variable">$1</span>');
		line = line.replaceAll(/\s([0-9]+)(?=\s|$)/g,' <span class="number">$1</span>');
		
		var lineContent = (line + str + message + comment);
		if(!lineContent) lineContent = '&nbsp;'; // '<span style="color: #660000">#blank line</span>';
		lines.push('<div class="line"><div id="ln_'+ln+'" class="lineNumber">'+ln+'&nbsp;</div>' + lineContent + '</div>');
	}
	SYNTAX_DIV.innerHTML = lines.join('');
	setTimeout(()=>{
		done_highlighting();
	},0);
}


// save to local storage
function save_to_browser() {
	try {
		window.localStorage.gruescriptSave = $('#gsEdit').val();
		GRUESCRIPT_SAVED = true;
		gs_console('saved to browser local storage');
	} catch(e) {
		gs_console("Couldn't access local storage")
	}
}

// autosave to local storage
AUTOSAVE_TIMEOUT = null;
AUTOSAVE_ERROR = false;
function autosave(forceP) {
	try {
		window.localStorage.gruescriptAutosave = $('#gsEdit').val();
		AUTOSAVE_ERROR = false;
	} catch(e) {
		if(!AUTOSAVE_ERROR) {
			gs_console("Couldn't access local storage");
		}
		AUTOSAVE_ERROR = true;
	}
}

function load_from_browser(from_autosave) {
	if(!GRUESCRIPT_SAVED && !from_autosave) {
		if(!confirm("You have unsaved changes. Restore anyway?")) {
			return;
		}
	}
	try {
		var savedGs = from_autosave ? window.localStorage.gruescriptAutosave :
			window.localStorage.gruescriptSave;
		
		if(from_autosave && !savedGs) {
			return false;
		}
		
		if(!savedGs && !from_autosave) {
			gs_console("couldn't restore - no saved content found in local storage");
			return false;
		}
		
		$('#gsEdit').val(savedGs);
		highlight();
		readGruescript();
		GRUESCRIPT_CHANGED = false;
		if(from_autosave) {
			return true;
		} else {
			GRUESCRIPT_SAVED = true;
		}
	} catch(e) {
		gs_console("Couldn't access local storage");
	}
}

// download the gruescript source
function download_gruescript() {
	download(get_filename(), $('#gsEdit').val());
	gs_console("downloading gruescript source. you can store this and reupload it later \
	with the Import button, or edit it offline.");
	GRUESCRIPT_SAVED = true;
}
FILENAME = '';
function get_filename() {
	var filename = $('#chooseFile').val()
	if(filename) {
		filename = filename.replace(/^.*[\\\/]/, '');
		FILENAME = filename;
		return filename;
	} else {
		var gamedata = getGameData();
		if(gamedata && gamedata.title) {
			FILENAME = gamedata.title.replace(/[^a-zA-Z0-9]/g, '_') + '.gru';
			return FILENAME;
		} else if(FILENAME) {
			return FILENAME;
		} else {
			return 'mygame.gru';
		}
	}
}
function get_export_filename() {
	return get_filename().replace(/\.gru$/,'.html');
}

// export the game
function export_game() {
	if(GRUESCRIPT_CHANGED) {
		if(!buildGame) {
			gs_console('<span class="error">build errors - can\'t export</span>');
			return false;
		}
	}
	restart_game();
	var html =
`<html>
	<head>
		<meta charset="UTF-8" />
		<style type="text/css">
			${ $('#exportableCSS').text() }
		</style>
		<script type="text/javascript" language="JavaScript">
			${ $('#jQueryMinJS').text() }
		</script>
		<script type="text/javascript" language="JavaScript">
			${ $('#exportableJS').text() }
		</script>
		<meta name="viewport" content="width=device-width, user-scalable=no" />
	</head>
	<body class="gs_export foo">
		${ $('#game')[0].outerHTML }
	</body>
	<!--
		The Gruescript code in the textarea below is NOT covered by
		the above licence agreement: the author may release it under
		whatever licence terms they wish. (Author, put your licence terms here, or as comments in your code, if you like.)
	-->
	<textarea id="gsEdit" style="display: none;">
${ $('#gsEdit').val() }
	</textarea>
</html>`;
	
	// remove the sample game and set IS_EXPORT to true
	html = html.replace('IS_EXPORT = false;', 'IS_EXPORT = true;');
	
	gs_console("Downloading Gruescript game. This is an HTML page which you can open in your browser, or upload to your own itch page or elsewhere.");
	download(get_export_filename(), html);
}


/*
 *
 *                           EXAMPLE GAMES
 *
 ********************************************************************/

EXAMPLES_SHOWN = false;
function doExamplesMenu() {
	if(EXAMPLES_SHOWN) {
		$('#examples_label').html("Examples &darr;");
		$('#examplesMenu').slideUp();
		EXAMPLES_SHOWN = false;
	} else {
		$('#examples_label').html("Examples &uarr;");
		$('#examplesMenu').slideDown();
		EXAMPLES_SHOWN = true;
		// if user leaves the menu open for 10s,
		// check the mouse isn't still over it,
		// and if it isn't, hide it
		setTimeout(()=>{hideExamples();},10000);
	}
}
function hideExamples() {
	// if mouse isn't currently over the menu, hide it
	if(!$('#examplesMenu:hover').length && !$('#examplesButton:hover').length) {
		$('#examplesMenu').slideUp();
		EXAMPLES_SHOWN = false;
	} else { // otherwise check again in 2s
		setTimeout(()=>{hideExamples();},2000);
	}
}

function loadExample(example) {
	if(!GRUESCRIPT_SAVED) {
		if(!confirm("You have unsaved changes. Load example anyway?")) {
			return false;
		}
	}
	if(!EXAMPLES[example]) {
		console.log('tried to load nonexistent example "'+example+'"??');
	}
	GSEDIT.value = EXAMPLES[example];
	GRUESCRIPT_CHANGED = false;
	GRUESCRIPT_SAVED = true;
	
	highlight();
	readGruescript();
	buildGame(true);
};

EXAMPLES = {};

/*
 *
 *   Locks and keys
 *
 *****************************************/


EXAMPLES['Locks and keys'] = `game Locks and keys example
author Robin Johnson
id EXAMPLE_LOCKS
examine on

room cell You're in a stone-walled cell.
tags start
north outside
west nook

# block the way out if the door is locked
verb go north
at cell
has door locked : The door creaks open... # if either assertion 'fails' - i.e. if the player is
# not in the cell, or the door does not have the 'locked' tag
say The door won't budge!

thing silver_key small silver key
name silver key
desc It's a narrow key made of tarnished silver with ornate carvings.
tags portable key
prop locktype silver
loc cell

thing door thick oak door (to north)
tags lockable locked
loc cell
prop locktype gold

verb examine
has $this lockable
say It's got a { $this.locktype } lock.

# make the 'locked' and 'unlocked' tags visible
tagdesc locked # you could also provide a description; otherwise...
tagdesc unlocked # ...Gruescript will use the name of the tag

# allow the player to attempt to unlock (or lock) any lock with any key
setverb unlock
has $this locked
!eq $held 0
has $held key

verb unlock
eq $held.locktype $this.locktype: {The $held} doesn't fit the lock on {the $this}. # message prints if assertion fails
untag $this locked: {The $held} turns anticlockwise in the lock. # message always prints
tag $this unlocked

setverb lock
has $this unlocked
!eq $held 0
has $held key

verb lock
eq $held.locktype $this.locktype: {The $held} doesn't fit the lock on {the $this}.
untag $this unlocked: {The $held} turns clockwise in the lock.
tag $this locked

room nook You're in a shadowy nook in the cell wall.
east cell

thing chest
desc A sturdy treasure chest.
tags lockable locked
prop locktype silver
loc nook
prop contents key

rule
has chest unlocked
eq $foundkey 0 # uninitiated variables are treated as having value 0
bring gold_key: The lid of the chest opens, and a gold key falls out!
assign foundkey 1

thing gold_key
desc A thick, heavy key made of shining gold.
tags portable key
prop locktype gold

room outside You're out in the fresh air.
south cell

rule
at outside
die You win!
`;

/*
 *
 *   NPCs
 *
 *****************************************/

EXAMPLES.NPCs = `game NPCs example
author Robin Johnson
id EXAMPLE_NPCs
examine on
conversation on # use conversation system

# initialise thiefdir randomly, and opposite_thiefdir to its opposite
assign opposite_thiefdir east
pick thiefdir these east west
eq $thiefdir east
assign opposite_thiefdir west

room statue_room You're in a studio scattered with chips of stone.
east painting_room
tags start

thing statue
desc It's a giant statue of a crocodile. Or maybe it's a normal-size statue of a giant crocodile, who can say?
tags art
prop creator sculptor
loc statue_room

thing sculptor
loc statue_room
tags alive male conversation
prop creation statue
prop start_conversation {The sculptor} pauses from sharpening his chisel, and looks at you.
prop end_conversation {The sculptor} nods, and goes back to sharpening his chisel.
prop met_name Hogmolion

# a procedure for 'meeting', an NPC, and changing their name
# (and grammar) accordingly

proc meet
assign $npc.name $npc.met_name
assign $npc.display $npc.met_name
tag $npc proper_name
tag $npc met


# If your game has "conversation on",
# - any thing with the "conversation" tag will
#   have the verb "talk", which opens a
#   conversation (if you're not currently talking
#   to that thing)
# - the verbs "ask", "tell" and "say", and any
#   verbs beginning "ask_", "tell_" or say_",
#   followed by a noun, become special, and can
#   take anything (or non-thing) as an object
# - the variable "conversation" contains the
#   thing (usually a person) you're talking to

setverb ask_sculptor sculptor
verb ask_sculptor sculptor
!has sculptor met
say "The name's Hogmolion," says the sculptor. "I'm the finest \
    sculptor on the block. Little sculpting joke, there."
assign npc sculptor
run meet

verb ask_sculptor sculptor
say "I told you, it's Hogmolion."

setverb ask_sculptor statue
verb ask_sculptor statue
here statue
say "That's my masterpiece, <i>Alegata</i>, says the sculptor, looking proudly at the statue.

verb ask_sculptor statue
say "That's my m&ndash;" the sculptor looks round, then gapes. "Where did it go??"

# 'tell' (or ask or say) on its own will match for whoever you're talking to
setverb tell thief
!eq $conversation thief
here thief

verb tell thief
assign shooer $conversation
run shoo_thief

proc shoo_thief
say {The $shooer} looks at the thief.
has $shooer.creation stolen
say "Oi!" {nom $shooer} shouts. "Put back my {$shooer.creation}!"
say With a guilty look, the thief removes {the $shooer.creation} from his sack and puts it back.
bring $shooer.creation
untag $shooer.creation stolen
proc shoo_thief
say "Oi!" {nom $shooer} shouts. "Get out!"
run move_thief

room painting_room You're in a paint-splattered studio.
west statue_room

thing painting
loc painting_room
desc It's a collection of brightly coloured splodges.
tags art
prop creator painter

thing painter
tags alive female conversation
loc painting_room
prop creation painting
prop met_name The Great Acylicia

setverb ask_painter painter
verb ask_painter painter
!has painter met
say "The Great Acrylicia," she says. "Pleased to meet you."
assign npc painter
run meet
verb ask_painter painter
say "You already asked, but I don't mind. I love talking about \
myself. I'm The Great Acrylicia," she says.

setverb ask_painter painting
verb ask_painter painting
here painting
say "I call it <i>Collection of Brightly-Coloured Splodges</i>," she says proudly.
verb ask_painter painting
say She looks round, confused. "My painting! Where is it?"

setverb tell_painter thief
here thief

# a more active npc
thing thief art thief
desc A lean and hungry gentleman, eyeing the place for potential swag.
loc painting_room
tags alive male conversation

setverb ask_thief
has $this art

verb ask_thief
!has $this stolen
say "Cor, I wouldn't mind half-inchin' that..."
verb ask_thief
say "I don't know nuffin' about it"

# 'animate' the thief, but not when you're taking to him
rule
assign thief_behaviour 0
!eq $conversation thief
assign thiefloc thief.loc
random thief_behaviour 3
rule
eq $thief_behaviour 1
!has thief just_moved
run move_thief
rule
eq $thief_behaviour 2
# thief does nothing
sayat thief.loc The thief glances shiftily around the room.
rule
eq $thief_behaviour 3
run attempt_theft

proc move_thief
# if the thief can't go any further in this direction, reverse it
assign thiefloc thief.loc
eq $thiefloc.dir.$thiefdir 0
run flip_thiefdir
continue

proc move_thief
sayat $thiefloc The thief sneaks away to {the $thiefdir}.
put thief $thiefloc.dir.$thiefdir
sayat thief.loc The thief sneaks in from {the $opposite_thiefdir}.
tag thief just_moved

proc flip_thiefdir
assign olddir $thiefdir
assign thiefdir $opposite_thiefdir
assign opposite_thiefdir $olddir

proc attempt_theft
# find something to try to steal
select in thief.loc
has $this art
assign stealing $this
try steal_art

proc steal_art # TRY to steal this art
sayat thief.loc The thief reaches out a bony hand towards {the $stealing}...
!here $stealing.creator # succeeds if the creator isn't there to guard it, otherwise we'll try the next proc block

proc steal_art # creator present
eq $conversation $stealing.creator # if they're busy talking to the player...
sayat thief.loc {The $stealing.creator} is too distracted to notice! # theft succeeds
sayat thief.loc The thief picks up {the $stealing} and puts it into a sack marked "SWAG".
hide $stealing
tag $stealing stolen

proc steal_art # creator present, not talking
sayat thief.loc {The $stealing.creator} slaps the thief's hand away!
continue # fails!

rule
untag thief just_moved`;

/*
 *
 *   CLOAK OF DARKNESS
 *
 *****************************************/

EXAMPLES['Cloak of Darkness'] = `# '#' means this line (or the rest of this line) is a comment
# (if you want to output '#' during your game, use "&num;")
game Cloak of Darkness # Game title
id CLOD # game ID (used to identify cookies; should be unique on your site)
author Roger Firth, adapted to Gruescript by Robin Johnson
version 0.0.1
person 2 # 2nd person, i.e. "You are in..."
examine off # if 'on', the verb 'examine' will be implemented by clicking nouns
status { $Room } | { $cloaked } # '|' divides left and right ends of status bar

# a portable item
thing cloak pitch-black opera cloak
carried # starts in inventory
tags portable wearable worn # all special engine-recognised tags

# setting "cloaked" will set the status bar
var cloaked Cloaked
rule
assign cloaked Cloaked
!has cloak worn
assign cloaked Uncloaked

# a room
room foyer You're in the foyer of the Opera House. # internal name and description
tags start # the player starts here
south bar # directions to other rooms
west cloakroom
north foyer

# block an exit
verb go north 
at foyer
say But you've only just arrived!

room bar You're in the bar.
north foyer

# set the state of the bar BEFORE entering it
verb go south
at foyer
run check_bar
continue # fails, so default movement behaviour will always happen

proc check_bar
carried cloak
tag bar dark # 'dark' is a special tag

proc check_bar
thingat cloak bar
tag bar dark

# both 'carried cloak' and 'thingat cloak bar' must have failed
proc check_bar
untag bar dark

rule
at bar
has bar dark
add mess 1
!eq $mess 2: You should probably go back out to the foyer &ndash; you wouldn't want to accidentally disturb anything in the dark. # message printed if assertion fails

room cloakroom You're in a small cloakroom.
east foyer

# non-portable item
thing hook brass hook
loc cloakroom # the room it starts in

# setverb blocks determine when to activate verbs for things
setverb hang hook # when to activate 'hang' verb for the hook
has $held wearable
# note: we're placing the 'hang' verb on the hook, rather than the cloak.
# in a parser game you would type "hang cloak" (or "hang cloak on hook")
# so we might have put the verb on the cloak instead. But it's more intuitive
# to see the verb button next to the hook: you hold the cloak, then look round
# the room, a bit like a graphical point-n-click. we'll change 'display' and
# 'prompt' for the verb, so that the player sees "hang cloak"

verb hang
display hang {$held} # how it's displayed in the button
prompt hang {$held} on {$this} # how it's displayed at the mock command prompt
tag $held hooked # add an (author-defined) tag
say You hang {the $held} on {the $this}.
put $held $this.loc # 'held' and 'this' are special contextual variables

tagdesc hooked on hook # will be displayed with the object

# taking anything that is 'hooked' removes that tag
verb take
has $this hooked # if an assertion 'fails', control will move to the native verb 'take'
untag $this hooked
continue # always 'fails', 'take' will pick up the action

thing dust dust (on the floor)
tags mass_noun # i.e. 'some dust', not 'a dust'
loc bar

rule
at bar
!has bar dark
lt $mess 3 # if the value of the variable 'mess' is less than 3
say A message is scrawled in the dust! It reads&colon;
die You win # end the game

rule
at bar
!has bar dark # rules are processed in order of declaration
say A message is scrawled in the dust!
say What a pity, it's too scuffed to read.
die You lose`;

/*
 * The Party Line
 *
 */

EXAMPLES['The Party Line'] = `game The Party Line
id TPLGS
author Robin Johnson
version 2.0
examine off
person 2
assign maxscore 5
assign maxinv 6
say You're still not sure what this party is about. The invitation \\
    came and, well, you weren't doing anything else. The cab drops you\\
    off and pulls away.
say
status {$room.Display} | Score {$score}/{$maxscore}

thing invitation party invitation
tags portable paper
carried
cverbs read

verb read invitation
say <center>YOU are invited to A STRANGE AND INEXPLICABLE PARTY!</center>
say <center>- Find the treasures - Solve the mystery - Lift the curse -</center>
say <center>Sinister Mansion, 7pm&mdash;eternity</center>

room front_steps You're on the front steps of a big house on the edge of town.
prop display Front steps
tags start

thing front_door
name door
loc front_steps
tags quiet
verbs knock

verb knock front_door
prompt knock on {$this}
say An elderly doorman answers the door, ushers you in, and locks the \\
    door behind you.
goto foyer

room foyer You're in a grand foyer at the foot of a staircase.
prop display Foyer
north ballroom
east cloakroom
west conservatory
up first_floor_landing

thing inside_front_door front door
name door
tags locked
loc foyer
verbs open

tagdesc locked

setverb unlock inside_front_door
held key
has inside_front_door locked

verb unlock inside_front_door
say The key turns in the lock.
untag inside_front_door locked

verb open inside_front_door
!here doorman: The doorman stops you. "You can't possibly be leaving so soon."
!has inside_front_door locked: It's locked.
has dancers crumbled: A magical force blocks your way, and an ethereal voice chants: "Lift the curse first!"
say You open the door and step out towards freedom and the nearest kebab.
die What a brilliant night
verb open inside_front_door # stop looking

verb go up
at foyer
lt $score 1
say The doorman stops you. "I am sorry, but only persons with at least one point are permitted to venture upstairs."

thing doorman elderly doorman
loc foyer
tags alive male
verbs talk

verb talk
prompt talk to {$this}


verb talk doorman
eq $score 0
random x 4
!eq $x 1: "Why not enjoy some music in the ballroom to the north?"
!eq $x 2: "Help yourself to some refreshments in the dining hall. It's \\
    through the ballroom, north then east."
!eq $x 3: "<span class="treasure">Treasures</span> may be deposited in \\
    the cloakroom to the east."
!eq $x 4: "Guests who enjoy plants are invited to view the conservatory to the west."
# first floor
verb talk doorman
gt $score 0
lt $score 5
random x 4
!eq $x 1: "For those of a sporting disposition, there is a billiard room upstairs. \\
    Bring your own balls."
!eq $x 2: "Books on a narrow variety of topics are available in the upstairs library, \\
    accessible through the billiard room."
!eq $x 3: "There is a comfortable home cinema, upstairs and to the west."
!eq $x 4: "Lavatory conveniences are available on the first floor. Or for our American \\
    friends, a 'bathroom' exists on the 'second' floor."
# further up
verb talk doorman
eq $score 5
random x 2
!eq $x 1: "The master bedroom is on the second floor, or more incorrectly the 'third' \\
    floor. I am afraid it is off limits to guests."
!eq $x 2: "There is a splendid roof garden atop of the building, boasting spectacular \\
    views of the surrounding environs. STAY OUT."

thing key front door key
tags portable

room conservatory You're in a conservatory.
prop display Conservatory
east foyer

thing plants fake plants
loc conservatory
tags plural

thing seeds packet of seeds
loc conservatory
tags portable plural

thing housecat friendly cat
name cat
loc conservatory
tags alive friendly
verbs pet
prop scareproc scare_cat

proc scare_cat
has housecat friendly
say The cat jumps, flattens its ears, and puffs up its fur.
untag housecat friendly
tag housecat angry
assign housecat.anger 10
write housecat.display angry cat

proc scare_cat
has housecat angry
say The cat wails. It's REALLY angry now.
add housecat.anger 10

rule
gt housecat.anger 0
add housecat.anger -1
eq housecat.anger 0
sayat housecat.loc The cat calms down.
untag housecat angry
tag housecat friendly
write housecat.display friendly cat

rule
gt housecat.anger 0
assign catloc housecat.loc
select dirs housecat.loc
eq $catloc.dir.$this $room
random x 2
eq $x 1
say You hear an enraged yowl nearby.

rule
here housecat
has housecat friendly
random x 5
!eq $x 1: The cat mews.
!eq $x 2: The cat chases its tail.
!eq $x 3: The cat nuzzles against you.
!eq $x 4: The cat purrs.
say The cat washes itself.

rule
here housecat
has housecat angry
random x 4
!eq $x 1: The cat yowls.
!eq $x 2: The cat bites its own tail.
!eq $x 3: The cat darts around the room.
say The cat hisses.

rule
random x 3
eq $x 1
assign catroom housecat.loc
run pick_catdir
sayat $catroom The cat walks {$catdir}.
isroom $catroom.dir.$catdir # leave this in till I've made all the rooms!
put housecat $catroom.dir.$catdir
run get_opposite
sayat housecat.loc The cat walks in from the {$opposite}.

# set a direction for the cat -
# it must be a cardinal compass direction,
# and must exist from the cat's current room
proc pick_catdir
pick catdir dirs housecat.loc
!contains $catdir these north east south west
run pick_catdir

proc get_opposite
eq $catdir north
assign opposite south
proc get_opposite
eq $catdir east
assign opposite west
proc get_opposite
eq $catdir south
assign opposite north
proc get_opposite
eq $catdir west
assign opposite east
proc get_opposite
log Couldn't get opposite direction to $catdir

verb pet housecat
has housecat friendly
has jeans worn: The cat paws playfully at your legs.
say The cat paws playfully at your jeans.

verb pet housecat
has housecat angry
say The cat scratches your legs violently. Ow!
write housecat.display angry cat
has jeans worn
!has jeans torn
say It tore your jeans.
write jeans.display pair of torn jeans
tag jeans torn

room ballroom You're in a huge ballroom.
prop display Ballroom
east dining_hall
south foyer

thing balloons
tags plural
loc ballroom
verbs take

verb take balloons
!carried balloon: You've already got one!
try check_carried: You can't carry any more.
give balloon: You take one.
verb take balloons # always succeed

proc check_carried
count x carried
lt $x $maxinv

thing balloon
tags portable
cverbs burst

verb drop balloon
say The balloon floats away.
hide balloon

verb burst balloon
hide balloon: BANG!
all here
has $this alive
assign scaree $this
run scare

proc scare # if $this has its own 'specific' scare proc
!eq $scaree.scareproc 0
run $scaree.scareproc

proc scare
!has $scaree fearless # 'fearless' characters do nothing
!has $scaree plural: {The $scaree} jump.
say {The $scaree} jumps.

verb go
at ballroom
!has dancers crumbled
has dancers still
say The immobile crowd is blocking the exits.
verb go
at ballroom
!has dancers crumbled
say You manage to weave a path through the dancing crowd.
continue

thing dancers crowd
name crowd
tags alive plural dancing fearless
loc ballroom

tagdesc dancing
tagdesc still standing still

proc set_dancer
assign a_dancer 0
random decade 8
add decade 1 # 2 to 9
continue

proc set_dancer
eq $decade 2 # 1920s
random x 2
write a_dancer a man in a blazer and splats
eq $x 2
write a_dancer a man in a blazer and spats

proc set_dancer
eq $decade 3 # 1930s
random x 2
write a_dancer a man in a crickey jersey
eq $x 2
write a_dancer a woman in a long silk dress

proc set_dancer
eq $decade 4 # 1940s
random x 2
write a_dancer a man in a World War II army uniform
eq $x 2
write a_dancer a woman in a military-style dress

proc set_dancer
eq $decade 5 # 1950s
random x 2
write a_dancer a man in a zoot suit
eq $x 2
write a_dancer a woman in a gingham dress

proc set_dancer
eq $decade 6 # 1960s
random x 2
write a_dancer a man in a Nehru jacket
eq $x 2
write a_dancer a woman in a mini-dress

proc set_dancer
eq $decade 7 # 1970s
random x 2
write a_dancer a man in a tie-dye shirt and flares
eq $x 2
write a_dancer a woman in dungarees and platform shoes

proc set_dancer
eq $decade 8 # 1980s
random x 2
write a_dancer a man in a Hawaiian shirt and Ray-bans
eq $x 2
write a_dancer a woman in a pantsuit with big shoulderpads

proc set_dancer
eq $decade 9 # 1990s
random x 2
write a_dancer a man in a flannel shirt and jeans
eq $x 2
write a_dancer a woman in a hoodie and striped leggings

proc set_dancer
eq $a_dancer 0
log couldn't set dancer! decade is $decade

rule
here dancers
has dancers dancing
run set_dancer
say {$A_dancer} jostles against you.

thing stage_thing stage
name stage
loc ballroom
verbs climb
prop climb_to stage

verb climb
!eq $this.climb_to 0: That doesn't look safe to climb.
say Up you go...
goto $this.climb_to

thing band band (on stage) # as seen from ballroom
loc ballroom
tags on_stage playing_good alive fearless

tagdesc on_stage
tagdesc playing_good playing great music
tagdesc playing_bad playing terrible music

thing banner banner (above stage)
loc ballroom
verbs read

verb read banner
say It reads: "&sung; The Ludonarrative Dissidents &sung;"

room stage You're on a wooden stage overlooking the ballroom.
prop display On stage
north backstage
down ballroom

verb go down
at stage
try got_instruments
run roadie_stops_you
continue

proc roadie_stops_you
has roadie crumbled # succeed

proc roadie_stops_you
!here roadie
!has roadie crumbled
say As you leave the stage, a roadie runs out from backstage.
bring roadie
run roadie_grabs_instruments

proc roadie_stops_you
!has roadie crumbled
say As you leave the stage, the roadie runs over to you.
run roadie_grabs_instrumentss

proc roadie_grabs_instrumentss
run count_instruments
!eq $num_instruments 1: He grabs all your musical instruments and puts them down on the stage.
select these accordion guitar trumpet xylophone
carried $this
say He grabs {the $this} and puts it down on the stage.

proc count_instruments
assign num_instruments 0
all these accordion guitar trumpet xylophone
carried $this
add num_instruments 1

proc got_instruments
select these accordion guitar trumpet xylophone
carried $this

thing accordionist
tags alive musician male playing
loc stage
prop has_instrument accordion
prop good_instrument accordion

thing guitarist
tags alive musician male playing
loc stage
prop has_instrument guitar
prop good_instrument guitar

thing trumpeter
tags alive musician male playing
loc stage
prop has_instrument trumpet
prop good_instrument trumpet

thing xylophonist
tags alive musician male playing
loc stage
prop has_instrument xylophone
prop good_instrument xylophone

tagdesc playing playing {$this.has_instrument}

# when the puzzle starts, the musicians get swapped out for their
# 'named' versions; the player doesn't know who's good at what
# instrument

thing John
tags alive musician male proper_name

thing Paul
tags alive musician male proper_name

thing George
tags alive musician male proper_name

thing Ringo
tags alive musician male proper_name

thing accordion
tags portable instrument
prop action {The $musician} squeezes {the $instrument}.

thing guitar
tags portable instrument
prop action {The $musician} strums {the $instrument}.

thing trumpet
tags portable instrument
prop action {The $musician} blows {the $instrument}.

thing xylophone
tags portable instrument
prop action {The $musician} hits {the $instrument} with little mallets.

rule
assign in_ballroom 0
contains $room these stage ballroom
assign in_ballroom 1

# play their instruments
rule
eq $in_ballroom 1
tag band playing_good
untag band playing_bad
all tagged musician
thingat $this stage
assign musician $this
assign instrument $this.has_instrument
run play_instrument

# have a musician play their instrument (or do nothing)
proc play_instrument
!eq $instrument 0
assign good_instrument $musician.good_instrument
sayat stage {$good_instrument.action}
!eq $instrument $good_instrument
untag band playing_good
tag band playing_bad

proc play_instrument
eq $instrument 0
run awkward_musician
untag band playing_good
tag band playing_bad

proc awkward_musician
!eq $musician $fumbling_musician
random x 4
!eq $x 1: {The $musician} claps awkwardly.
!eq $x 2: {The $musician} hums awkwardly.
!eq $x 3: {The $musician} taps {pos $musician} feet awkwardly.
say {The $musician} dances awkwardly.

rule
assign booed 0
eq $in_ballroom 1
has dancers dancing
has band playing_bad
untag dancers dancing
tag dancers still
sayat stage The band starts playing badly.
say The crowd boos and stops dancing.
assign booed 1

rule
eq $in_ballroom 1
!has dancers dancing
has band playing_good
sayat ballroom The band starts playing great music.
say The crowd cheers and starts dancing.
untag dancers still
tag dancers dancing

rule
eq $in_ballroom 1
eq $booed 0
has band playing_bad
say The crowd boos.

rule
!eq $fumbling_musician 0
#say fumbling_musician is not zero
assign no_instruments 1
try instruments_on_stage
assign no_instruments 0
run random_instrument_on_stage
sayat stage {The $fumbling_musician} grabs {the $instrument}.
hide $instrument
assign $fumbling_musician.has_instrument $instrument
tag $fumbling_musician playing
assign fumbling_musician 0 #: set fumbling_musician to 0
assign just_grabbed 1 #: set just_grabbed to 1

rule
!eq $fumbling_musician 0
eq $no_instruments 1
assign fumbling_musician 0

rule
assign everybody_has_an_instrument 1
try musicians_without_instrument
assign everybody_has_an_instrument 0
eq $fumbling_musician 0
eq $just_grabbed 0 #: just_grabbed is not 0
run random_musician_without_instrument
assign fumbling_musician $musician #: fumbling musician is now {$musician}
sayat stage {The $fumbling_musician} fumbles around the stage.

rule
eq $just_grabbed 1
assign just_grabbed 0 #: set just_grabbed to 0

rule
eq $everybody_has_an_instrument 1
thingat roadie stage
sayat stage The roadie goes backstage.
put roadie backstage
sayat backstage The roadie comes backstage.

# check there is at least one musician on stage with NO instrument
proc musicians_without_instrument
select tagged musician
thingat $this stage
eq $this.has_instrument 0

proc random_musician_without_instrument
pick musician these John Paul George Ringo
!eq $musician.has_instrument 0
run random_musician_without_instrument

# assign a random instrument onstage to 'instrument'
proc random_instrument_on_stage
pick instrument these accordion guitar trumpet xylophone
!eq $instrument.loc stage
run random_instrument_on_stage

# check there is at least one instrument on stage
proc instruments_on_stage
select tagged instrument
eq $this.loc stage

setverb polish_stage wood_polish
carried wood_polish
at stage

verb polish_stage
display polish stage
prompt polish stage
say Scrub, scrub...
say The polish makes the stage very slippery.
run drop_instruments
assign everybody_has_an_instrument 0
run roadie_ohno
run initialise_musicians
!has dancers crumbled
has dancers dancing
untag dancers dancing
tag dancers still

proc drop_instruments
all tagged musician
thingat $this stage
!eq $this.has_instrument 0
sayat stage {The $this} drops {the $this.has_instrument}.
untag $this playing
put $this.has_instrument stage
assign $this.has_instrument 0

proc roadie_ohno
!here roadie
!has roadie crumbled
bring roadie: A roadie rushes out from backstage to help.
eq $musicians_initialised 0
say "John! Paul! George! Ringo!" she says helpfully. "You've dropped all your instruments!"

proc initialise_musicians
eq $musicians_initialised 0 # only do this once
assign musicians_initialised 1
hide accordionist
hide guitarist
hide trumpeter
hide xylophonist
bring John
bring Paul
bring George
bring Ringo
# shuffle instruments
all these John Paul George Ringo
assign set_musician $this
run set_instrument

proc set_instrument
pick instrument these accordion guitar trumpet xylophone
!has $instrument assigned
assign $set_musician.good_instrument $instrument
tag $instrument assigned
proc set_instrument
run set_instrument # keep trying

rule
at backstage
has band playing_bad
!has band crumbled
say You hear booing.

room backstage You're in a backstage area.
prop display Backstage
south stage

thing roadie clapped-out roadie
tags alive female
loc backstage
verbs talk

verb talk roadie
at stage
say "I'm busy!" she snaps.

verb talk roadie
random year 40
add year 1969 # 1970 to 2009
run set_band_name
say The roadie tells you about the time she toured with {$band_name} \\
    in {$year}.

proc set_band_name
pick adjective these Steel Screaming Metal Flying Crashing Rocking \\
    Temperate Fuschia Dark Impenetrable Partial Lime Sandy Polar \\
    Magenta Creamy Thankful Nocturnal Artillery Contorted Hateful \\
    Tasteless President Wiry Celestial Nuclear War Cyan Sergeant Flat \\
    Crystal Large Short Wooden Paper
pick noun these Insect Airship Woman Fred Tulip Rock Vampire King Honey\\
    Bolognese Vulture Tiger Birthday Gate Lad Maid Cop Tree Pin \\
    Skeleton Murderer Graveyard String Belief Sutra Sect Face Occasion \\
    Garden Lizard Sorcerer Weight Hatchet Building Spider Mollusc \\
    Distance Servant Devil Toad Scarf Weather Ocean Knife Kidney Speed
random x 2
write band_name {$adjective} {$noun}
eq $x 1
write band_name the {$adjective} {$noun}s

thing t_shirt band T-shirt
name T-shirt
tags portable wearable
loc backstage

thing platinum_disc <span class="treasure">platinum disc</span>
name disc
tags portable treasure
loc backstage

verb take platinum_disc
here roadie
say The roadie won't let you.

rule
at backstage
here roadie
carried platinum_disc
say The roadie takes the platinum disc from you and puts it down.
bring platinum_disc

room cloakroom You're in a cloakroom.
prop display Cloakroom
west foyer

rule
at cloakroom
run count_treasures
assign score $num_treasures

proc count_treasures
assign num_treasures 0
all here
has $this treasure
add num_treasures 1

thing treasures_sign cardboard sign
name sign
verbs read
loc cloakroom

verb read treasures_sign
say It reads: "Drop <span class="treasure">treasures</span> here!"

thing walking_cane walking cane
name cane
tags portable
loc cloakroom


room dining_hall You're in a dining hall.
prop display Dining hall
north kitchen
west ballroom

thing banquet_table banquet table
name table
loc dining_hall

thing cheese
tags edible on_table party_food
loc dining_hall
prop tray cheese_tray

thing vegetables
tags edible on_table party_food
loc dining_hall
prop tray vegetable_tray

thing drinks
tags drinkable plural on_table party_food
loc dining_hall
prop tray drinks_tray

tagdesc on_table on table

# 'portable' foods can only be eaten while carried...
setverb eat
has $this edible
carried $this

# ...others (like food on tables) can be eaten any time
setverb eat
has $this edible
!has $this portable

verb eat
say Delicious!
hide $this
has $this party_food
thingat head_chef kitchen
assign just_eaten $this
run chef_trigger

verb drink
say Glug, glug...
hide $this
has $this party_food
thingat head_chef kitchen
assign just_eaten $this
run chef_trigger

proc push_orders
assign third_order $second_order
assign second_order $first_order
assign first_order $just_eaten
assign just_eaten 0

proc pop_orders
assign first_order $second_order
assign second_order $third_order
assign third_order 0

setverb drink
has $this drinkable

proc chef_trigger
sayat dining_hall A head chef enters the room from the north. "They have finished all the {$just_eaten}!" she yells.
sayat dining_hall She walks back north.
sayat kitchen The head chef pops her head through the door to the south. \\
"They have finished all the {$just_eaten}!" she yells.

room kitchen
prop display Kitchen
east scullery
south dining_hall

thing head_chef head chef
name head chef
loc kitchen
tags alive female
verbs talk

verb talk head_chef
say The head chef won't talk to the likes of you.

thing sous_chef sous-chef
name sous-chef
loc kitchen
tags alive male
verbs talk

verb talk sous_chef
here head_chef
say "Can't talk, or the boss will be furious with me."

verb talk sous_chef
!has chefs_hat worn
"Can't talk, the boss could be back any minute."

verb talk sous_chef # while wearing chef's hat
!lt sous_chef.anger 4
say The sous-chef shouts "That's it! I quit!"
say He takes off his washing-up glvoes and throws them a the floor, \\
    then storms out.
bring gloves
hide sous_chef

thing gloves washing-up gloves
tags portable wearable plural

verb talk sous_chef
add sous_chef.anger 1
!eq sous_chef.anger 1: "Let me be, boss, I'm working as fast as I can."
!eq sous_chef.anger 2: "Please, boss, you're undervaluing me."
!eq sous_chef.anger 3: "Stop pestering me, boss, let me do my job!"
!eq sous_chef.anger 4: "Boss, I swear if you criticise me one more \\
    time, I'll quit!"

thing cheese_tray tray of cheeses
name cheese tray
loc kitchen
prop contents cheese

thing vegetable_tray tray of vegetables
name vegetable tray
loc kitchen
prop contents vegetables

thing drinks_tray tray of drinks
name drinks tray
loc kitchen
prop contents drinks

rule
at kitchen
thingat head_chef kitchen
thingat sous_chef kitchen
eq $just_eaten 0
eq $first_order 0
say The head chef shouts at the sous-chef.
assign x 4
!eq $x 1: The sous-chef washes some dishes.
!eq $x 2: The sous-chef chops some ingredients.
!eq $x 3: The sous-chef scrubs the worktop.
say The sous-chef mixes some ingredients.

rule
thingat head_chef kitchen
thingat sous_chef kitchen
!eq $first_order 0
sayat kitchen The head chef shouts to the sous-chef, "They need more {$first_order}!"
assign tray $first_order.tray
run pop_orders
run take_tray

rule
!eq $just_eaten 0
run push_orders

proc take_tray
thingat $tray kitchen
sayat kitchen The sous-chef picks up {the $tray}, carries it south, and\\
    comes back.
sayat dining_hall A sous-chef arrives with {a $tray}, sets it down, and\\
    goes back north.
put $tray.contents dining_hall
hide $tray

proc take_tray # tray not at kitchen
sayat kitchen The head chef shouts to the sous-chef, "We have run out \\
    of {$tray.contents}! How could you let this happen!"
sayat kitchen She takes her hat off, throws it at the floor, and \\
    storms out in a rage.
sayat dining_hall With a furious cry of "OUT of {$tray.CONTENTS}!", a \\
    head chef storms in from the north, and leaves to the west.
sayat ballroom An enraged head chef storms in from the east, elbows \\
    her way through the crowd, and leaves to the south.
sayat foyer An enraged head chef storms in from the north. The doorman \\
    opens the door to allow her to leave, then immediately locks it \\
    behind her.
hide head_chef
put chefs_hat kitchen

thing chefs_hat chef's hat
name chef's hat
tags portable wearable

thing michelin_star <span class="treasure">Michelin star</span>
name star
tags portable treasure
loc kitchen

verb take michelin_star
here head_chef
say The head chef won't let you.

verb take michelin_star
here sous_chef
run sous_chef_guard_star

proc sous_chef_guard_star
!has chefs_hat worn: The sous-chef won't let you. "You said you wanted \\
    to keep that on display, boss."
say The sous-chef won't let you.

thing refrigerator
loc kitchen
tags container
verbs open
prop contents boiled_eggs

thing boiled_eggs cold hardboiled eggs
name eggs
tags portable edible

verb eat boiled_eggs
say Ouch! They're so tough, you hurt your teeth trying.


room scullery You're in a scullery
prop display Scullery
west kitchen

thing washing_machine
loc scullery
verbs open
tags container
prop contents jeans

thing jeans pair of jeans
tags portable wearable plural

verb open
has $this container
!eq $this.contents 0: There's nothing inside.
!eq $this.contents multiple
say Something falls out.
bring $this.contents
assign $this.contents 0

verb open
has $this container
eq $this.contents multiple
say Some things fall out.
assign $this.contents 0
assign container $this
all things
    eq $this.contained_in $container
    bring $this
    assign $this.contained_in 0

thing wrench
prop contained_in cupboards
tags portable

thing wood_polish can of wood polish
tags portable
prop contained_in cupboards

thing cupboards
loc scullery
tags container plural
prop contents multiple
verbs open

############## 1st floor ###########

room first_floor_landing You're on a first floor landing.
prop display First floor landing
north billiard_room
east bathroom_hallway
west home_cinema
up second_floor_landing
down foyer

verb go up
at first_floor_landing
here teenager
say The teenager is crying on the stairs, blocking the way.

thing photographs photographs (on wall)
loc first_floor_landing
verbs look

verb look photographs
display look
prompt look at photographs
say The photographs go back several decades. They show various rooms \\
in this house, always with a party going on.

thing teenager teenage boy (crying on stairs)
loc first_floor_landing
tags alive male
verbs talk

verb talk teenager
carried owidget
run give_owidget

verb drop owidget
here teenager
say Dropped.
run give_owidget

proc give_owidget
say The boy is delighted. "You found my oWidget! Thanks, old person."
say He grabs the widget and runs off.
hide owidget
hide teenager

verb talk teenager
say He blubs, "I lost my oWidget Femto! It was brand new!"

rule
here teenager
pick cries these cries sobs wails sniffs weeps blubbers whimpers
say The teenager {$cries}.

room home_cinema You're in a home cinema.
prop display Home cinema
east first_floor_landing

thing tv gargantuan-screen TV
name TV
loc home_cinema
verbs watch

verb watch tv
run watch_tv
assign tv_watched 1

rule
eq $primary_character 0
run make_tv_character
assign primary_character $character

rule
eq $secondary_character 0
run make_tv_character
assign secondary_character $character

rule
eq $tv_scene 0
run make_tv_scene
assign tv_scene $scene

rule
eq $tv_watched 0
at home_cinema
eq $been_in_cinema 1
run watch_tv

rule
at home_cinema
assign been_in_cinema 1

rule
eq $tv_watched 1
assign tv_watched 0

proc watch_tv
here tv
eq $plot_introduced 0
run make_tv_action
run make_tv_scene
say On the TV, {a $primary_character} is {$action} \\
    {a $secondary_character} in {a $tv_scene}.
assign plot_introduced 1

proc watch_tv
here tv
random x 7
run nextscene

proc nextscene
eq $x 1
run advance_plot
run make_tv_action
say On the TV, {the $primary_character} is now {$action} \\
    {a $secondary_character} in {a $tv_scene}.
proc nextscene
eq $x 2
run make_tv_scene
run make_new_characters
run make_tv_action
say The TV cuts to a {$tv_scene}, where {a $primary_character} is \\
    {$action} {a $secondary_character}.
proc nextscene
eq $x 3
run make_tv_action
say On the TV, {the $primary_character} and {the $secondary_character} \\
    are now {$action} each other.
proc nextscene
eq $x 4
run make_tv_character
say On the TV, {the $primary_character} and {the $secondary_character} \\
    are now {$action} {a $character}.
random y 5
eq $y 1 # replace one of the characters
pick replaced_character these primary_character secondary_character
assign $replaced_character $character # note assignment to variable REFERENCE
proc nextscene
eq $x 5
run make_tv_character
run make_tv_action
say On the TV, {the $primary_character} and {the $secondary_character} \\
    are now {$action} {a $character}.
random y 5
eq $y 1 # replace one of the characters
pick replaced_character these primary_character secondary_character
assign $replaced_character $character # note assignment to variable REFERENCE
proc nextscene
eq $x 6
run make_tv_scene
say On the TV, {the $primary_character} and {the $secondary_character} \\
    arrive at {a $tv_scene}.
proc nextscene
eq $x 7
run make_tv_character
run make_tv_action
pick old_character these $primary_character $secondary_character
say On the TV, {a $character} appears and starts {$action} the {$old_character}.
random y 3
eq $y 1 # replace one of the characters
pick replaced_character these primary_character secondary_character
assign $replaced_character $character

proc make_new_characters
run make_tv_character
assign primary_character $character
run make_tv_character
assign secondary_character $character

proc advance_plot
random x 2
run make_tv_character
eq $x 1 # promote the secondary character to primary and introduce a new secondary
assign primary_character $secondary_character
assign secondary_character $character
proc advance_plot
eq $x 2 # keep the primary character and change the secondary
assign secondary_character $character

proc make_tv_character
pick character these robot ape man woman prince princess knight wizard \\
    hobbit elf vampire werewolf cat dog blob captain \\
    shark cowboy soldier zombie alien astronaut ghost \\
    dinosaur cop lieutenant horse giant bat superhero terrorist \\
    president witch farmer motorcyclist athlete miner boxer trucker \\
    criminal assassin detective mobster archeologist servant professor \\
    mermaid spy housewife clown singer fishwife geisha goth governor \\
    ninja samurai maid model grandmother grandfather actor actress \\
    nerd nun nurse doctor peasant pilot scientist
    
proc make_tv_scene
assign old_scene $tv_scene
pick tv_scene these spaceship island skyscraper lake lagoon railway field \\
    stadium school city moon ship planet crater explosion wedding funeral \\
    lab bunker ruin castle restaurant cafe airport farm village inn \\
    forest mine mountain ocean beach desert church prison cemetary \\
    apartment courtroom store elevator fairground library museum \\
    office mall theatre aeroplane
    
proc make_tv_action
pick action these kissing fighting chasing punching killing \\
    shooting hitting

thing comfy_chairs comfy chairs
name chairs
loc home_cinema

thing popcorn_machine popcorn machine
loc home_cinema
verbs push_button

verb push_button
display push button
prompt push button
run make_popcorn

thing bucket popcorn bucket
tags portable

tagdesc water full of water

setverb drink bucket
carried bucket
has bucket water

verb drink bucket
say Glug, glug...
untag bucket water

thing popcorn bucket of popcorn
tags portable edible

verb eat popcorn
say Delicious!
swap popcorn bucket

proc make_popcorn
has popcorn_machine broken
say The machine fizzles sadly.

proc make_popcorn
!has popcorn made
bring popcorn: A bucket of popcorn appears.
tag popcorn made

proc make_popcorn
inscope popcorn
say A robotic voice says "FINISH--THAT--ONE--FIRST"

proc make_popcorn
!inscope bucket
say A robotic voice says "NO--BUCKET--DETECTED"

proc make_popcorn
say A robotic arm extends, grabs the popcorn bucket, and draws it \\
    inside the machine.
hide bucket
!has bucket water
say The bucket reappears, filled with fresh popcorn.
bring popcorn

proc make_popcorn #bucket is in scope and full of water
say A robotic voice says "AAARGH--WATER--SHORT--CIRCUI*fizz*"
tag popcorn_machine broken

thing oscar <span class="treasure">Oscar</span>
tags portable treasure
loc home_cinema

thing brochure
tags portable paper
loc home_cinema
cverbs read

verb read brochure
say It reads: "Congratulations on purchasing your Popcorn-a-tron 9000!
say Simply PUSH BUTTON for delicious popcorn
say This model doubles as an anti-theft device"

verb take oscar
here popcorn_machine
!has popcorn_machine broken
say A robotic voice says "ATTEMPTED--THEFT--DETECTED"
say A robotic arm extends from the popcorn machine, grabs the Oscar, \\
    and puts it back.

room billiard_room You're in a billiard room.
prop display Billiard room
east library
south first_floor_landing

thing billiards billiard table
loc billiard_room
verbs play

thing pool_sharp
tags alive male
loc billiard_room
verb talk

verb talk pool_sharp
say "Let's play pool!"

verb play billiards
!here pool_sharp
say There isn't anyone here to play with.

verb play billiards
say "Great!" says the pool player. "I'll rack 'em up!"
inscope walking_cane: He looks sad. "Aw, but we don't have a cue."
say He grabs the walking cane. "We can use this as a cue!"
bring walking_cane
inscope boiled_eggs: He looks sad. "Aw, but there aren't any balls."
bring boiled_eggs
say He takes the hardboiled eggs and puts them on the table. "We can use these as balls!"
run do_game

proc do_game
!has geometry_book read
say You play... and lose.
say "Too bad," says the pool sharp. "Maybe you ought to brush up."
proc do_game
say You play... and win!
say The pool sharp frowns. "It's not fair! These balls aren't even round."
say He drops the walking cane and sulks off.
hide pool_sharp

thing trophy <span class="treasure">billiards trophy</span>
tags portable treasure
loc billiard_room

verb take trophy
here pool_sharp
say The pool sharp won't let you.


room library You're in a library.
prop display Library
west billiard_room

thing bookcase
loc library
verbs browse

verb browse bookcase
!has bookcase got_book
tag bookcase got_book
bring geometry_book: A book falls off.
verb browse bookcase
say Just some boring books.

thing geometry_book geometry textbook
name textbook
tags portable paper
cverbs read

verb read geometry_book
has geometry_book torn
say A few pages have been ripped out, but nothing important.
continue
verb read geometry_book
say You flick through the book, and learn a few facts about lines and \\
    angles.
tag geometry_book read


room bathroom_hallway You're in a long hallway.
prop display Long hallway
west first_floor_landing

# not necessary - 'enter' doesn't appear till it's unlocked
# verb enter bathroom_door
# at bathroom_hallway
# here queue
# say Someone in the queue shouts, "Hey! There's a line, you know!"
# has bathroom_door locked
# say It's locked.

thing queue queue for bathroom
loc bathroom_hallway
prop scareproc scarequeue
prop length 20

rule
write queue.display short queue for bathroom
gt queue.length 5
write queue.display queue for bathroom
gt queue.length 15
write queue.display long queue for bathroom

proc scarequeue
say A few people in the queue jump.

thing bathroom_door bathroom door
name door
loc bathroom_hallway
tags locked

setverb knock bathroom_door
has bathroom_door locked

setverb enter bathroom_door
!has bathroom_door locked

verb enter bathroom_door
say OK.
goto bathroom

verb knock bathroom_door
!has bathroom_door knocked
say A voice whispers, "Paper!"
tag bathroom_door knocked

verb knock bathroom_door
has queue moving
has bathroom_door locked
say A voice shouts, "Occupied!"

verb knock bathroom_door
!eq $held 0: A voice whispers, "Paper!"
has $held paper: A voice whispers, "Paper!"
assign paper $held
hide $paper
say The door briefly openes. A hand shoots out and grabs {the $paper}. \\
    "That'll do!"
say The door closes and locks. You hear ripping paper.
tag queue moving
eq $paper geometry_book
tag geometry_book torn
put geometry_book bathroom

rule # simple 'flipper' between 0 and 1
has queue moving
add flush 1
eq $flush 2
assign flush 0

rule
has queue moving
eq $flush 1
run do_flush

proc do_flush
has toilet_seat unbolted
sayat bathroom_corridor You hear a clatter and a curse.
continue
proc do_flush
has queue moving
say You hear a flush.

rule
has queue moving
eq $flush 0
eq queue.length 0 # last occupant
sayat bathroom_hallway The bathroom door opens. Someone comes out, and leaves.
untag bathroom_door locked
untag queue moving

rule
has queue moving
eq $flush 0
gt queue.length 0
sayat bathroom_hallway The bathroom door opens. Someone comes out, someone goes in. The lock clicks.
add queue.length -1
eq queue.length 0
hide queue # but it's still "moving"

rule
here queue
random x 5
!eq $x 1: Someone in the queue jumps up and down.
!eq $x 2: Someone in the queue hops on one foot.
!eq $x 3: Someone in the queue fidgets.
!eq $x 4: Someone in the queue crosses their legs.
say Someone in the queue jumps up and down.

room bathroom You're in a bathroom.
prop display Bathroom
west bathroom_hallway

thing sink
loc bathroom

setverb fill bucket
here sink
!has bucket water

verb fill bucket
say You fill the bucket with water from the sink.
tag bucket water

thing toilet
loc bathroom

thing toilet_seat <span class="treasure">gold toilet seat</span>
name toilet seat
tags portable treasure
loc bathroom

verb take toilet_seat
!has toilet_seat unbolted
say It's bolted to the toilet.

setverb unbolt toilet_seat
!has toilet_seat unbolted
held wrench

verb unbolt toilet_seat
here man_in_bath
say "Hey!" says the man in the bath. "You can't go dismantling other \\
    people's bathrooms."

verb unbolt toilet_seat
say It comes loose.
tag toilet_seat unbolted
say You notice an electronic gadget floating in the toilet.
bring owidget

thing bath
loc bathroom

thing man_in_bath man in underwear
name man
loc bathroom
tags alive male in_bath
verbs talk

tagdesc in_bath in bath

verb talk man_in_bath
carried t_shirt
!has t_shirt worn
run give_man_tshirt

verb drop t_shirt
here man_in_bath
run give_man_tshirt

proc give_man_tshirt
say The man snatches the T-shirt and puts it on.
hide t_shirt
tag man_in_bath t_shirt
run do_bathman_clothes

verb talk man_in_bath
carried jeans
!has jeans worn
run give_man_jeans

verb drop jeans
here man_in_bath
run give_man_jeans

proc give_man_jeans
say The man snatches the jeans and examines them.
!has jeans torn
say "I wouldn't be seen dead in these," he says. "They're not even torn!"
say He tosses them out of the bath.
tag man_in_bath spoken
bring jeans

proc give_man_jeans # jeans are torn
say "Thanks! These look great," he says, and puts them on.
hide jeans
tag man_in_bath jeans
run do_bathman_clothes

proc do_bathman_clothes
has man_in_bath t_shirt
!has man_in_bath jeans
say "I'll need some trousers too," he says.
tag man_in_bath spoken
write man_in_bath.display man in underwear and T-shirt
proc do_bathman_clothes
has man_in_bath jeans
!has man_in_bath t_shirt
say "I'll need a shirt too," he says.
tag man_in_bath spoken
write man_in_bath.display shirtless man in jeans
proc do_bathman_clothes # has jeans AND T-shirt
say "Now excuse me, I ought to find an ambulance", he says.
say He pulls himself out of the bath and leaves the room.
hide man_in_bath

verb talk man_in_bath
add man_in_bath.talk_cycle 1
gt man_in_bath.talk_cycle 3
assign man_in_bath.talk_cycle 1
continue

verb talk man_in_bath
tag man_in_bath spoken
!eq man_in_bath.talk_cycle 1: "I copped off with a hot medical \\
    student, then woke up here."
!eq man_in_bath.talk_cycle 2: "I think she stole my kidneys!"
!eq man_in_bath.talk_cycle 3: "Please fetch me some clothes so I can get out."

rule
here man_in_bath
!has man_in_bath spoken
pick shouts these shouts yells shrieks
tag man_in_bath spoken
random x 4
!eq $x 1: The man in the bath {$shouts}, "Help!"
!eq $x 2: The man in the bath {$shouts}, "Please help!"
!eq $x 3: The man in the bath {$shouts}, "Help me!"
say The man in the bath {$shouts}, "Please help me!"

rule
untag man_in_bath spoken

thing owidget electronic widget
name widget
tags portable floating

verb take owidget
!has gloves worn 
say You're not sticking your bare hands in there.

verb take owidget
try check_carried
say You stick a gloved hand in and pull it out.
say Now that you're holding it, you can see the brandingI it's an "oWidget Femto".
assign owidget.display oWidget Femto
untag owidget floating
give owidget

tagdesc floating floating in toilet

############## 2nd floor ###########

room second_floor_landing You're on a second floor landing.
prop display Second floor landing
north master_bedroom
down first_floor_landing
up roof_landing

verb go up
at second_floor_landing
here drunk_person
say The passed out drunk person is lying on the stairs, blocking the \\
    way.

thing drunk_person passed out drunk person (on stairs)
loc second_floor_landing
tags alive nonbinary
prop scareproc wake_drunk

proc wake_drunk
say The drunk person wakes up with a jump, and stumbles away.
hide drunk_person

room master_bedroom You're in a master bedroom.
prop display Master bedroom
south second_floor_landing

thing bed four-poster bed
loc master_bedroom

thing host old man (in bed)
loc master_bedroom
name old man
tags alive male
verbs talk

verb talk host
has dancers crumbled
say "Thank you, thank you," he says. "Now please leave. I could do \\
    with some sleep."

verb talk host
!has host talked
say The old man looks at you with exhausted eyes.
say "Please lift the curse," he says weakly. "This party has been \\
    going on for over 90 years! I just want my house back.
say Here... you'll need this access pass for the roof garden."
give garden_pass
tag host talked

verb talk host
say "Please..." he groans. "Lift the curse!"

thing garden_pass access pass
name pass
tags portable wearable

############## roof ###########

room roof_landing You're on the roof, at the top of the stairs.
prop display Roof landing
north roof_garden
down second_floor_landing

verb go north
at roof_landing
try check_garden_pass

proc check_garden_pass
!has garden_pass worn
say BZZZT! An electrical forcefield blocks your way.
proc check_garden_pass
say Your access pass bleeps happily.
continue

room roof_garden You're in a roof garden.
prop display Roof garden
south roof_landing

thing flower_bed flower bed
name flower bed
loc roof_garden

setverb plant seeds
here flower_bed

verb plant seeds
say You plant the seeds in the flower bed.
say A beanstalk grows up into the clouds!
bring beanstalk

thing beanstalk
verbs climb
prop climb_to cloud

############## clouds ###########

room cloud You're standing on a cloud.
prop display Cloud
down roof_garden

thing sky_palace sky palace
name palace
loc cloud
verbs enter

verb enter sky_palace
lt $score 5
say A magical forcefield blocks your way.
say An ethereal voice chants: "Only the five-times blessed may enter \\
    the Palace of Celebria!"

verb enter sky_palace
say OK.
goto palace

room palace You're in a divine palace.
prop display Cloud palace
out cloud

thing incense incense bowls
name incense
loc palace

rule
add light_colour 1
gt $light_colour 4
assign light_colour 1

rule
at palace
!eq $light_colour 1: The incense bowls flash red.
!eq $light_colour 2: The incense bowls flash yellow.
!eq $light_colour 3: The incense bowls flash blue.
!eq $light_colour 4: The incense bowls flash green.


thing angels choir of angels
tags alive plural
loc palace

# This is a way to do cycling messages with a large number of cycles, so
# you don't need to keep track of how many there are.
rule
add angel_chant 1
at palace
# These are from Google Translate and are probably almost, but not 
# quite, completely wrong
!eq $angel_chant 1: The angels chant "VOLO DANCUM QUID SUMBODIUS"
!eq $angel_chant 2: The angels chant "GUILELMA IOANNA EST NON MEUS AMICAM"
!eq $angel_chant 3: The angels chant "OPORTET PUGNAS QUI IUSTUM PARTIUM"
!eq $angel_chant 4: The angels chant "HOMICIDUS IN DANCUM FLORUS"
!eq $angel_chant 5: The angels chant "BOOMUS SHACUS SHACUS SHACUS CAMERA"
!eq $angel_chant 6: The angels chant "CONSOCIATIONE IUEVENES CHRISTIANA"
!eq $angel_chant 7: The angels chant "AMOR SHACUS BABII"
!eq $angel_chant 8: The angels chant "VENTILABIS EAM REM BENE"
!eq $angel_chant 9: The angels chant "AH, AH, AH, AH, RELIQUIS VIVIT"
!eq $angel_chant 10: The angels chant "IUMPO CIRCUM, IUMPO, IUMPO, IUMPO"
!eq $angel_chant 11: The angels chant "NON LEGIMUS MEA FACIA POCER"
!eq $angel_chant 12: The angels chant "EFFUNDAM DE SACCHARO MEI"
!eq $angel_chant 13: The angels chant "OMNES AMBULANT DINOSAURUM"
!eq $angel_chant 14: The angels chant "AMOR ME VOLUMINE ET PETRAM"
!eq $angel_chant 15: The angels chant "MIA HUMPUS, MIA BUMPUS, MIA AMABILI LUMPUS FEMINA"
!eq $angel_chant 16: The angels chant "FAMILIA SUMUS"
!eq $angel_chant 17: The angels chant "PUELLAE TANTUM VELLE BEATITUDINEM"
!eq $angel_chant 18: The angels chant "SI VOLO EAM TIBI, DEBUERA CIRCUMDEDERIS",
!eq $angel_chant 19: The angels chant "ALIUS EST ENIM PULVIS IN MORSU URSORUM",
!eq $angel_chant 20: The angels chant "NON POTES TANGERE"
say The angels chant "CELEBRAMUS SIMILIS EST MCMXCIX
assign angel_chant 0

thing celebria Celebria, Goddess of Partying
name Celebria
tags alive female proper_name
loc palace
verbs talk

proc meet_celebria
assign celebria.name Celebria
assign celebria.display Celebria, goddess of partying
tag celebria proper_name

verb talk celebria
!has host talked
say "Mortal, you have no business with Celebria!"
run meet_celebria

verb talk celebria
!has boombox got
say Celebria takes pity on you.
say "Very well, mortal. I shall give you the means to lift the curse. Use \\
    this artefact wisely, for it holds diabolical power!
say She lifts Her arms, and a devilish boombox descends from on high.
bring boombox
tag boombox got

verb talk celebria
say She is too busy partying to grant you an audience.

thing boombox Pandora's boombox
tags portable proper_name

setverb play boombox
!has boombox boombox_playing

setverb stop boombox
has boombox boombox_playing

tagdesc boombox_playing playing awful songs

verb play boombox
tag boombox boombox_playing: Click.

verb stop boombox
untag boombox boombox_playing: Click.

rule
assign playing_here 0
has boombox boombox_playing
inscope boombox
assign playing_here 1
add track 1
!eq $track 1: The boombox plays "Mull of Kintyre".
!eq $track 2: The boombox plays "Agadoo".
!eq $track 3: The boombox plays "Delilah".
!eq $track 4: The boombox plays "Achy Breaky Heart".
!eq $track 5: The boombox plays "Crazy Frog".
!eq $track 6: The boombox plays "Mr Blobby".
!eq $track 7: The boombox plays "Barbie Girl".
!eq $track 8: The boombox plays "Thong Song".
!eq $track 9: The boombox plays "The Cheeky Song".
!eq $track 10: The boombox plays "You're Beautiful".
!eq $track 11: The boombox plays "The Millennium Prayer".
!eq $track 12: The boombox plays "The Birdie Song".
!eq $track 13: The boombox plays "Itsy Bitsy Teeny Weenie Yellow Polka Dot Bikini".
!eq $track 14: The boombox plays "Living Next Door to Alice".
!eq $track 15: The boombox plays "Teletubbies Say 'Eh-Oh'".
!eq $track 16: The boombox plays "Earth Song".
!eq $track 17: The boombox plays "I Wish I Could Fly".
!eq $track 18: The boombox plays "Friday".
!eq $track 19: The boombox plays "Surfin' Bird".
!eq $track 20: The boombox plays "Star Trekkin'".
!eq $track 21: The boombox plays "Im' Too Sexy".
!eq $track 22: The boombox plays "Mmmbop".
!eq $track 23: The boombox plays "The Hamster Dance".
!eq $track 25: The boombox plays "Could It Be Magic".
!eq $track 26: The boombox plays "Get Ready For This".
!eq $track 27: The boombox plays "Chirpy Chirpy Cheep Cheep".
!eq $track 28: The boombox plays "Candle in the Wind".
!eq $track 29: The boombox plays "Rockin' Robin".
!eq $track 30: The boombox plays "The Fog on the Tyne".
!eq $track 31: The boombox plays "Shaddap You Face".
!eq $track 32: The boombox plays "Hooray Hooray It's a Holi-Holiday".
!eq $track 33: The boombox plays "There's No One Quite Like Grandma".
!eq $track 34: The boombox plays "The Chicken Song".
!eq $track 35: The boombox plays "All I Want For Christmas is You".
!eq $track 36: The boombox plays "I Wanna Be a Hippy".
!eq $track 37: The boombox plays "I Should Be So Lucky".
!eq $track 38: The boombox plays "No Limits".
!eq $track 39: The boombox plays "Do Ya Think I'm Sexy".
!eq $track 40: The boombox plays "Saturday Night Dance".
say The boombox plays "My Ding-a-Ling".
assign track 0

rule
eq $playing_here 1
!at palace
all here
has $this alive
!eq $this cat
assign crumblee $this
run crumble
eq $this crowd
say The boombox stops playing and disappears.
untag boombox boombox_playing
hide boombox

proc crumble
eq $crumblee doorman
say The doorman screams, turns into a skeleton, and crumbles to dust.
hide doorman
tag doorman crumbled
say A key falls from the point where his shirt pocket was.
bring key

proc crumble
has $crumblee plural
say {The $crumblee} crumble away to dust.
continue
proc crumble
!has $crumblee plural
say {The $crumblee} crumbles away to dust.
continue
proc crumble
hide $crumblee
tag $crumblee crumbled

rule
has band crumbled
all these John Paul George Ringo roadie
tag $this crumbled
hide $this

rule
has John crumbled
tag band crumbled
hide band
tag roadie crumbled
hide roadie`;

EXAMPLES["El manto de la oscuridad"] = `# '#' significa que esta linea es un comentario
# (si necesitas escribir '#' en tu juego, usa "&num;")
game El manto de la oscuridad # Título del juego
id EMDLO # ID del juego (usado para identificar cookies; debería ser único en tu web)
author Roger Firth, adaptada a Gruescript por Robin Johnson. Traducida por Ruber Eaglenest.
version 0.0.2
person 2 # 2ª persona, i.e. "Estás en..."
examine off # si está a 'on', el verbo 'examinar' estará implementado clicando en los nombres
status { $Room } | { $cloaked } # '|' divide la parte izquierda y derecha de la barra de estado
localise talking_to Hablando con: #Aquí comienza la traducción
localise ask_about Pregunta sobre: #de los mensajes del 
localise tell_about Habla sobre:   #sistema.
localise say	Decir:
localise its_dark	Está oscuro.
localise you_can_also_see Además, puedes ver:
localise you_can_also_see_scroller Además puedes ver
localise youre_holding	En las manos:
localise youre_carrying	Llevas:
localise youre_wearing	Llevas puesto:
localise taken	Hecho. #Para evitar coger malsonante en latino
localise you_cant_carry_any_more No puedes llevar más cosas.
localise dropped	Hecho. #Se podría poner Dejado.
localise exits	Salidas:
localise actions	Acciones:
localise you_cant_see	¡No puedes ver!
localise its_too_dark_to_see_clearly	Está demasiado oscuro para ver con claridad.
localise you_see_nothing_special_about_that No ves nada especial en {the $this}.
localise ok_youre_wearing_it OK, ahora llevas puesto {obj $this}.
localise ok_youve_taken_it_off OK, ahora te has quitado {obj $this}.
localise time_passes	El tiempo pasa...
localise you_start_talking_to	Empiezas a hablar con {the $this}.
localise you_stop_talking_to	Paras de hablar con {the $this}.
localise you_are_dead	Estás muerto
localise and	y # (when listing room contents in scroller)
localise or	o # (not currently used)
localise save_button	guardar partida
localise restore_button	restaurar partida
localise restart_button	reiniciar juego
localise undo	deshacer
localise cant_undo	No se puede deshacer, lo siento
localise undone	Desecho "{$this}"
localise restart_prompt	¿Reiniciar el juego?
localise restart_confirm Reiniciar
localise restart_cancel	Continuar
localise save_prompt	Guardar partida como:
localise save_confirm	Guardar
localise save_cancel	Cancelar
localise options	opciones
localise credits	créditos
localise font	fuente
localise font_size	tamaño_fuente
localise print_room_title_in_scroller Imprimir título de localización en scroll:
localise list_objects_in_scroller Listar objetos en scroll:
localise options_title	Mostrar opciones
localise options_always	Siempre
localise options_landscape_only	Solo panorámico
localise options_never	Nunca
localise options_done	hecho

# Traducción de las salidas.
verb go north
display norte
continue

verb go south
display sur
continue

verb go east
display este
continue

verb go west
display oeste
continue

# Traducción de verbos
verb wait
display esperar
continue

verb remove
display desvestir #esto sí ha funcionado
continue

verb wear
display vestir
continue

verb drop
display dejar
continue

verb take
display tomar #Se podría poner Coger, si lo prefieres
continue

# un objeto portable
thing manto manto de ópera negro como la noche
carried # comienza en el inventario
prop def el manto # definimos el texto del objeto con "el" español, sino pondría "the manto"
prop indef un manto
tags portable wearable worn # etiquetas especiales reconocidas por el motor Gruescript

# asignar "cloaked" cambiará la barra de estado
var cloaked Embozado
rule
assign cloaked Embozado
!has manto worn
assign cloaked Desembozado

# a room
room vestibulo Estás en el vestíbulo de la Ópera. # nombre interno y descripción
tags start # el jugador comienza aquí
south bar
west guardarropa
north vestibulo

# bloquear una salida
verb go norte
at vestibulo
say ¡Pero si acabas de llegar!

room bar Estás en el bar.
north vestibulo
tags dark # esta habitación está oscura

# las reglas se evalúan en cada turno
rule
tag bar dark
!thingat manto bar # ! significa NO. la regla parará aquí si la aserción falla
untag bar dark

rule
at bar
has bar dark
add mess 1
!eq $mess 2: Deberías volver al vestíbulo &ndash; no querrás perturbar accidentalmente algo en la oscuridad. # el mensaje se imprime si la aserción falla

room guardarropa Estás en un pequeño guardarropa.
east vestibulo

# objeto no portable
thing percha percha de bronce
loc guardarropa # la localización donde comienza
prop def la percha
prop indef una percha

# el bloque setverb determina cuando se activan los verbos para los objetos
setverb colgar percha # activar 'hang' para la percha
has $held wearable
# nota: vamos a colocar el verbo 'colgar' en la percha, en vez de en manto.
# en un juego de parser escribiríamos "colgar manto" (o "colgar manto en la percha")
# así que podríamos haber puesto el verbo en el manto. Pero es más intruitivo
# ver el verbo al lado de la percha: sostienes el mando, miras alrededor
# de la habitación, como en una aventura gráfica, y cambiaremos el 'display'
# para que el jugador vea el 'prompt' como "colgar manto"

verb colgar
display colgar {$held} # cómo se muestra el botón
prompt colgar {$held} en {$this} # cómo se muestra el comando en el prompt
tag $held hooked # añadir una etiqueta definida por el autor
say Cuelgas {the $held} en {the $this}.
put $held $this.loc # 'held' y 'this' son variables especiales contextuales

tagdesc hooked en la percha # será monstrado con el objeto

# tomar algo que está 'hooked' (colgado) elimina la etiqueta
verb take
has $this hooked # si la aserción 'falla', el control se dará al verbo nativo 'take'
untag $this hooked
continue # siempre 'falla', 'take' continuará con la acción

thing polvo polvo (en el suelo)
loc bar

rule
at bar
!has bar dark # si el bar no está a oscuras
lt $mess 3 # si el valor de la variable 'mess' (follón) es menor que 3
say Hay un mensaje escrito en el suelo! Dice&colon;
die Has ganado # finaliza el juego

rule
at bar
!has bar dark # las reglas se procesan en el orden de declaración
say Hay un mensaje escrito en el suelo!
say Pero qué pena, está demasiado emborronado como para leerlo.
die Has perdido`;