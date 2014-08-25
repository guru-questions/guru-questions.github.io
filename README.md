# Guru Questions

## Editing Questions

To edit/add/remove questions navigate to the following page: [_data/questions.yml][] and then click the small edit button which will take you to the [edit page][].

Make your desired edits to the page following these rules:

- The file starts with a single line containing `"---"` -- **this must not be removed**
- Each question must be on a single line
- That line must start with `"- "` (dash-space)
- The question itself must be enclosed within double quotes
- You may add comments by starting the line with `'#'`

Once you're happy with your changes fill in the "Commit changes" form at the bottom of the page. This requires only a simple message. This can be as descriptive or as non-descriptive as you like. Adding better messages describing your changes here may help you later.

You can then hit the "Commit changes" button and your changes should appear very soon on the [live site][] at [http://guru-questions.github.io/](http://guru-questions.github.io/).

[_data/questions.yml]:https://github.com/guru-questions/guru-questions.github.io/blob/master/_data/questions.yml
[edit page]: https://github.com/guru-questions/guru-questions.github.io/edit/master/_data/questions.yml
[live site]: http://guru-questions.github.io/

## Editing Text

There is a limited facility for editing the text on the site using a method similar to that for editing the questions.

Instead of `_data/questions.yml` you need to instead be editing [_data/strings.yml][] using its [editing page][] as above.

The format of this file is different from the questions list. It starts with the important `---` preface as before but after that come a set of lines that follow a `key: "value"` format.

When editing this file it's vital that you never change the "key" part of each line, that is you should only edit the contents of the double quotes. 

If you change the key value it will stop the text from appearing in the page.

Make your changes & commit as before and the site will update shortly.

[_data/strings.yml]: https://github.com/guru-questions/guru-questions.github.io/blob/master/_data/strings.yml
[editing page]: https://github.com/guru-questions/guru-questions.github.io/edit/master/_data/strings.yml