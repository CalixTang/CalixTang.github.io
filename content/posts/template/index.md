---
title: 'Template Post'
date: 2024-05-31T00:00:00-04:00
draft: true
searchHidden: true
genres: genre1, genre2
summary: A Template Post to use when writing
# url: /template/
tags: 
- tag1
- tag2
---

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Normal text. Lorem ipsum. Realistically, with this font size there's no reason to use headings 4 and smaller.


# Markdown text

## Text modifiers

**Bold text** is done with 2 asterisks on each side (`**Bold text**`). \
*Italics* are applied with 1 asterisk on each side (`*Italics*`). \
<u>Underline</u> is applied with `<u>` element from HTML \
~~Strikethrough~~ is applied with 2 tildes on each side (`~~Strikethrough~~`). \
> 'Admonition' is applied with a greater-than symbol (`>`).\

> Block quotes can also be written this way
>
> — <cite>Source [^1]</cite>

<mark>Highlighted</mark> text applied with the `<mark>` element in HTML.

[^1]: Footnote stuff, etc.

## Tables

You have to draw tables in markdown manually...

| Table  | Table |
| - | - |
| A | 123 |
| B | 456.789 |


## Indentation

Make newlines with single backslash (`\`). \

### Ordered List

Ordered lists with numbers:
1. First item
2. Second item
3. Third item

Unordered lists with dashes:
- First
- Second
- Third

Nested Unordered Lists with indentation:
- First
  - first sub
  - second sub
- Second
  - first sub
  - second sub

Nested Mixed List

1. aaaa
    - bbbb
2. asdfasdf
    - asdfasdf
    - asdf
- cccc
    1. dddd

<!---
This is a block comment in markdown
-->

## Twisty Puzzle Objects
This is a `twisty-puzzle` object from [cubing.js](https://js.cubing.net/cubing/).
{{< twisty-puzzle alg = "R U R' U'" >}} 


## Latex
There are both inline and block equations available. For example:

### Inline Eqn

The Koopman update is written as $z_{t+1} = Kz_t$.

### Block Eqn

For SINDy, we can expand the dictionary of elementary functions $\Theta(X) \in \R^{N \times d}$ as:

$$\Theta(X) = 
\begin{bmatrix} 
    \vert & \vert & \dots & \vert \\\
    \theta_1(X) & \theta_2(X) & \dots & \theta_d(X) \\\
    \vert & \vert & \dots & \vert
\end{bmatrix}$$ 

where each $\theta_k$ is a function applied over the entire data matrix $X$. 



# Images and Embed Content

Centered image example with a raw markdown image (`![name](yellow_tang.png#center)`):
![name](yellow_tang.png#center)

Figures are implemented as a PaperMod shortcode:
{{< figure align=center src="lockin.jpg" title="Figure 1: literally me" >}}
<!---TODO: figure out how to get footnote references into figures-->

