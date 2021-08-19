GRUESCRIPT

Gruescript is a scripting language/online tool for creating
point-n-click text adventures. For more information and full
documentation, see the docs/gruescript.odt (LibreOffice format).

'index.html' is the Gruescript tool. This is identical to the online
version. It should run from your filesystem with no problems.

The directory 'res' contains javascript and css. To make it easy for
Gruescript to download the authored game (especially when running from
the filesystem), only editor-specific code and styling is included in
these files. The rest is embedded in index.html.

The directory 'stuff' contains two files:

*  template.html

This is an HTML template for a Gruescript game. Write (or paste) your
gruescript between the <textarea> and </textarea> tags near the
bottom of this file, and mess with the styling as you wish, as long as
the divs used by gruescript still exist - "topbar_left",
"topbar_right", "scroller" (containing "scroller_content"),
"room_description", "holding" and "inventory".

To develop offline, you can edit your gruescript directly inside this
file with your editor of choice, while also keeping the file open in a
browser for quick iteration.

* gruescript-npp-syntax.xml

This is a syntax highlighting definition file for Notepad++ (made for
dark mode). It's actually not quite as clever as the highlighter in the
online tool, but it'll be helpful if you write Gruescript in N++.


LICENCE

Gruescript, this readme, and all the source files in the "res"
directory are copyright (c) 2021 Robin Johnson and are released under
the MIT License: https://opensource.org/licenses/MIT
(JQuery, which is included in "jquery-2.2.0.min.js", is released under
the same licence, but not by me.)

The documentation "Creating Text Adventure Games On Your Computer With
Gruescript" is copyright (c) 2021 Robin Johnson and released under the
Creative Commons (Attribution) License:
https://creativecommons.org/licenses/by/3.0/


BUGS

Gruescript is still in beta and there will be many of these. Please
raise an issue on github
<https://github.com/robindouglasjohnson/gruescript> or report to
robindouglasjohnson@gmail.com, with details of what happened, what you
were doing, and what browser you were using. Thanks!
