# Installation

1. If you don't already have it, get cloud9: <code>git clone https://github.com/ajaxorg/cloud9.git</code>
     
1. Place the chesterfield folder under <code>cloud9/ext/</code>

1. Place pushapp.png under <code>cloud9/style/icons/</code>

1. Register the plugin with cloud9 by going into <code>cloud9/server/cloud9/ide.js</code> and adding <code>"ext/chesterfield/chesterfield"</code> to <code>Ide.DEFAULT_PLUGINS</code>

1. Start cloud9: <code>bin/cloud9.sh</code>