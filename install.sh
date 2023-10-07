#!/bin/bash

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "Bun is not installed. Installing now..."
    npm i -g bun
    if [[ $? -ne 0 ]]; then
        echo "Failed to install bun. Aborting."
        exit 1
    fi
else
    echo "Bun is already installed."
fi

bun install
if [[ $? -ne 0 ]]; then
    echo "Failed to run 'bun install'. Aborting."
    exit 1
fi

bun run build
if [[ $? -ne 0 ]]; then
    echo "Failed to run 'bun run build'. Aborting."
    exit 1
fi

# Ensure $HOME/bin and $HOME/lib exists
mkdir -p $HOME/lib
mkdir -p $HOME/bin

# Move ask.js to $HOME/lib
mv ask.js $HOME/lib/

# Create a new shell script that will act as the 'ask' command
echo '#!/bin/bash' > $HOME/bin/ask
echo "bun $HOME/lib/ask.js" >> $HOME/bin/ask

# Make the new shell script executable
chmod +x $HOME/bin/ask

# Only append if the modification doesn't already exist
if ! grep -q 'export PATH=$HOME/bin:$PATH' $HOME/.bashrc; then
    echo 'export PATH=$HOME/bin:$PATH' >> $HOME/.bashrc
fi

echo 'Setup complete. Run "ask" to get started.'
echo 'Note: PATH modification applied to .bashrc. If using a different shell, please adjust accordingly.'
