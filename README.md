# Secret Santa Website

Generic website for hosting an online secret santa. 

# Setup

First make sure you have firebase available on your machine.
```sh
npm install -g firebase-tools

firebase login
```

Clone the repo and install all dependencies.
```sh
git clone git@github.com:vaibhav-trq/SecretSanta.git
cd SecretSanta

# Install dependencies
npm install
npm install --prefix public
npm install --prefix functions
```

# Testing

After making any changes use the following command to test your changes locally.
```sh
sh ./emulate.sh
```
