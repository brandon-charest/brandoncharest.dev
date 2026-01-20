+++
title = "Fractional Indexing"
template = "page.html"
draft = true
+++

Lexorank
Instead of numbers 1, 2, 3, use strings "aaaa", "aaab", "aaac".

Insert between "aaaa" and "aaab" -> "aaaaa".



Inverted Index: This maps Content -> Document.

    Example: "Find all playlists that contain 'Taylor Swift'."

    Term: "Taylor Swift" -> Value: [Playlist_A, Playlist_B]

Forward Index / Key-Value Lookup: This maps Document -> Content.

    Example: "Give me the content of Playlist A."

    Key: "Playlist_A" -> Value: [Song_1, Song_2, Song_3]