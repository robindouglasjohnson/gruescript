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
	
	loadExample("Cloak of Darkness");
	
	GSEDIT.addEventListener('input', function() {
		highlight();
		GRUESCRIPT_CHANGED = true;
		GRUESCRIPT_SAVED = false;
	});
	// only allow pasting plain text
	GSEDIT.addEventListener('paste', function(e) {
		// Prevent the default action
		e.preventDefault();

		// Get the copied text from the clipboard
		const text = (e.clipboardData)
			? (e.originalEvent || e).clipboardData.getData('text/plain')
			// For IE
			: (window.clipboardData ? window.clipboardData.getData('Text') : '');
		
		if (document.queryCommandSupported('insertText')) {
			document.execCommand('insertText', false, text);
		} else {
			// Insert text at the current position of caret
			const range = document.getSelection().getRangeAt(0);
			range.deleteContents();

			const textNode = document.createTextNode(text);
			range.insertNode(textNode);
			range.selectNodeContents(textNode);
			range.collapse(false);

			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		}
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
		line = line.replace(/(^\s*(write|is|room|thing|tagdesc)\s+[a-zA-Z_]+\s+)(.*)$/g, '$1<span class="string">$3</span>');
		var str = '';
		var strIx = line.indexOf('<span class="string">');
		if(strIx>=0) {
			str = line.substring(strIx);
			line = line.substring(0,strIx);
		}
		
		// commands
		// todo: might save a few milliseconds if the words in these regexps were sorted by most common first
		line = line.replaceAll(/(^\s*)(run|hide|bring|give|carry|wear|put|putnear|goto|swap|tag|untag|tagroom|untagroom|assign|write|add|random|say|die|open|close|status|isthing|isroom|log)(?=\s|$)/g,'$1<span class="command">$2</span>');
		// assertions
		line = line.replaceAll(/(^\s*)(!?(carried|held|here|inscope|visible|at|thingat|near|has|hasany|hasall|taghere|cansee|is|eq|gt|lt|continue|try|js))(?=\s|$)/g,'$1<span class="assertion">$2</span>');
		// iterators
		line = line.replaceAll(/(^\s*)(!?(sequence|select|all))(?=\s|$)/g,'$1<span class="iterator">$2</span>');
		// block types
		line=line.replaceAll(/(^\s*)(game|room|exit|thing|rule|verb|setverb|proc|tagdesc|var)(?=\s|$)/g,'$1<span class="blocktype">$2</span>');
		
		// special tags, variables and property names, and iterator lists
		line=line.replaceAll(/\s(things|rooms|carried|in|tagged|these|here|inscope|start|dark|portable|wearable|worn|alive|lightsource|plural|indef|def|male|female|nonbinary|list_last|quiet|on|off|score|maxscore)(?=\s|$)/g,' <span class="specialtag">$1</span>');

		// properties and directions
		line=line.replaceAll(/(^\s*)(prop|name|desc|north|northeast|east|southeast|south|southwest|west|northwest|up|down|in|out|fore|aft|port|starboard|id|author|version|person|examine|tags|dir|loc|verbs|cverbs|display|prompt|color|colour)(?=\s|$)/g,'$1<span class="prop">$2</span>');

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
	window.localStorage.gruescriptSave = $('#gsEdit').val();
	GRUESCRIPT_SAVED = true;
	gs_console('saved to browser local storage');
}

function load_from_browser() {
	if(!GRUESCRIPT_SAVED) {
		if(!confirm("You have unsaved changes. Restore anyway?")) {
			return;
		}
	}
	var savedGs = window.localStorage.gruescriptSave;
	if(!savedGs) {
		gs_console("couldn't restore - no saved content found in local storage");
		return;
	}
	
	$('#gsEdit').val(savedGs);
	highlight();
	readGruescript();
	GRUESCRIPT_CHANGED = false;
	GRUESCRIPT_SAVED = true;
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

############# conversation system ############

# you can try to talk to any human, if you're not having a conversation already
setverb talk
hasany $this human conversation
eq $talking 0

verb talk
has $this conversation: {The $this} takes no notice.
prompt talk to {$this}
assign talkee $thing
assign talking 1
# openconv, endconv and noreply will be set by the specific talk verb for each npc,
# but if they aren't, use default messages
!eq $openconv 0: You strike up a conversation with {the $talkee}.
say {$openconv}

# ...and stop talking at any time
setverb stoptalk
eq $this $talkee
eq $talking 1

verb stoptalk
display stop talking
prompt stop talking to {$this}
assign talking 0
!eq $endconv 0: You stop talking to {the $talkee}.
say {$endconv}

conversation ends automatically with no message if the talkee is no longer in scope
(probably because you left the room)
rule
eq $talking 1
!inscope $talkee
assign talking 0

# clean up variables when conversation is over
rule
eq $talking 0
assign endconv 0
assign talkee 0
assign noreply 0

# when talking, you can "ask about" anything in scope
setverb ask
eq $talking 1

verb ask
display ask about
prompt ask {$talkee} about {$this}
!eq $noreply 0: {The $talkee} isn't interested in talking about {a $this}. # default message
say {$noreply} # character-specifc "no reply" message


# then everyone who can talk should have:
# - the tag 'conversation'
# - a specific verb 'talk' like that writes the 'openconv', 'noreply'
#    and 'endconv' variables
# then use specific verbs 'ask foo' for anything you can ask ABOUT,
# with a line 'eq talkee


room statue_room You're in a studio scattered with chips of stone.
east painting_room
tags start

thing statue
desc It's a giant statue of a crocodile. \
Or maybe it's a normal-size statue of a giant crocodile, who can say?
tags art
prop creator sculptor
loc statue_room

thing sculptor
loc statue_room
tags human male conversation
prop creation statue

verb talk sculptor
write openconv {The sculptor} pauses from sharpening his chisel, and looks at you.
write noreply {The sculptor} doesn't seem to be paying attention.
write endconv {The sculptor} nods, and goes back to sharpening his chisel.
continue

verb ask sculptor # what you're asking about
eq $talkee sculptor # who you're asking
!has sculptor met
say "The name's Hogmolion," says the$ sculptor. "I'm the finest sculptor on the block. Little sculpting joke, there."
assign sculptor.name Hogmolion
assign sculptor.display Hogmolion
tag sculptor proper_name
tag sculptor met
verb ask sculptor
is talkee sculptor
has sculptor met
say "I've already introduced myself," says {the sculptor}. "It's Hogmolion, remember?"

verb ask statue
is talkee sculptor
say "That's my masterpiece, <i>Alegata</i>," says {the sculptor}.


room painting_room You're in a paint-splattered studio.
west statue_room

thing painting
loc painting_room
desc It's a collection of brightly coloured splodges.
tags art
prop creator painter

thing painter
tags human female conversation
loc painting_room
prop creation painting

verb talk painter
write openconv {The painter} looks at you brightly.
write noreply {The painter} hums to herself, oblivious to you.
write endconv {The painter} nods you away hastily.
continue

verb ask painter
eq $talkee painter
!has painter met
say {The painter} bows and says "I am the Great Acrylica!"
write painter.display The Great Acrylica
write painter.name Great Acrylica
tag painter met
# but not proper_name, so "The/the Great Acrylica" will work

verb ask painter
eq $talkee painter
# we don't actually need "!has painter met", because if that's true,
# the verb block above will have succeeded by now
say {The painter} bows again and says "I am STILL the Great Acrylica!"

verb ask painting
eq $talkee painter
say "I call it 'Collection of Brightly Coloured Splodges'," says {the painter}.


# a more active npc
thing thief art thief
desc A lean and hungry gentleman, eyeing the place for potential swag.
loc painting_room

# keep track of which way the thief is moving
var thiefdir west
var opposite_thiefdir east

# 'animate' the thief every turn
rule
assign thiefloc thief.loc
random thief_behaviour 3
rule
eq $thief_behaviour 1
run movethief
rule
eq $thief_behaviour 2
# thief does nothing
sayat thief.loc The thief glances shiftily around the room.
rule
eq $thief_behaviour 3
run attempt_theft

proc movethief
# if the thief can't go any further in this direction, reverse it
eq $thiefloc.dir.$thiefdir 0
run flip_thiefdir

proc movethief
sayat $thiefloc The thief sneaks away to the {$thiefdir}.
put thief $thiefloc.dir.$thiefdir
sayat thief.loc The thief sneaks in from the {$opposite_thiefdir}.

proc flip_thiefdir
assign olddir $thiefdir
assign thiefdir $opposite_thiefdir
assign opposite_thiefdir $olddir

proc attempt_theft
# find something to try to steal
select here
has $this art
assign stealing $this
try steal_art
say The thief picks up {the $stealing} and puts it into a sack marked "SWAG".

proc steal_art # TRY to steal this art
sayat thief.loc The thief reaches out a bony hand towards {the $stealing}...
!here $stealing.creator # succeeds if the creator isn't there to guard it, otherwise we'll try the next proc block

proc steal_art # creator present
eq $talkee $stealing.creator # if they're busy talking to the player...
sayat thief.loc {The $stealing.creator} is too distracted to notice! # theft succeeds

proc steal_art # creator present, not talking
sayat thief.loc {The $stealing.creator} slaps the thief's hand away!
continue # fails!`;

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
tags dark # this room is dark

# rules run every turn
rule
tag bar dark
!thingat cloak bar # ! means not. the rule will stop here if the assertion fails
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
say You hang {the $held} on the {the $this}.
put $held $this.loc # 'held' and 'this' are special contextual variables

tagdesc hooked on hook # will be displayed with the object

# taking anything that is 'hooked' removes that tag
verb take
has $this hooked # if an assertion 'fails', control will move to the native verb 'take'
untag $this hooked
continue # always 'fails', 'take' will pick up the action

thing dust dust (on floor)
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