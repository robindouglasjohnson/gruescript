GRUESCRIPT

Gruescript is a scripting language/online tool for creating
point-n-click text adventures. For more information and full
documentation, see the docs/gruescript.odt (LibreOffice format).

'index.html' is the Gruescript tool. This is identical to the online
version. It should run from your filesystem with no problems. It's
known to work with recent versions of Chrome, Firefox and Edge.

The directory 'res' contains javascript and css. To make it easy for
Gruescript to download the authored game (especially when running from
the filesystem), only editor-specific code and styling is included in
these files. The rest is embedded in index.html.

The directory 'stuff' contains 'gruescript-npp-syntax.xml'. This is a
syntax highlighting definition file for Notepad++ (made for dark mode).
It's actually not quite as clever as the highlighter in the online
tool, but it'll be helpful if you write Gruescript in N++.

If you want to work completely offline, the easiest way is to 'download'
your game (or a blank game) as an HTML page from the Gruescript tool,
and then edit the gruescript in the resulting HTML document, near the
bottom between the <textarea> and </textarea> tags. (A previous bundle
included a 'template.html' file, but this way you'll always have the
latest engine code.) You can then mess with the layout and styling of
that page however you like.

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
