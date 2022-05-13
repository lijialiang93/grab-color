# grab-color

CLI to get dominant colors out of an image

## Installation

```
npm install -g grab-color
```

install dependency on Apple M1
```
arch -arm64 brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

## Usage

```
grab-color -p <path-to-image> -c <number-of-color-to-extract> -o <output-data-image>
```

example

```
grab-color -p ./lena.png -c 5 -o ./output.jpg
```
