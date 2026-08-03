+++
title = "Speaking Redis: Implementing the RESP Protocol"
date = "2026-02-12"
description = "Building a recursive parser for the Redis Serialization Protocol using Rust's Cursor."

[taxonomies]
tags = [ "redis", "parsing", "rust" ]

[extra]
growth = "growing"
type = "project"
+++


RESP (Redis Serialization Protocol)

## The Data Structure

I represented the protocol using a Rust Enum.

```rust,name=src/resp.rs
#[derive(Debug, Clone, PartialEq)]
pub enum RespValue {
    SimpleString(String),  // +OK\r\n
    SimpleError(String),   // -Error message\r\n
    Integer(i64),          // :1000\r\n
    BulkString(String),    // $5\r\nhello\r\n
    Array(Vec<RespValue>), // *2\r\n...
    Null,
}
```

## Serializing

Each variant knows how to turn itself back into raw bytes. The format is straightforward — prefix byte, content, `\r\n` terminator.

```rust,name=src/resp.rs
impl RespValue {
    pub fn serialize(&self) -> Vec<u8> {
        match self {
            RespValue::SimpleString(s) => format!("+{}\r\n", s).into_bytes(),
            RespValue::SimpleError(s) => format!("-{}\r\n", s).into_bytes(),
            RespValue::Integer(i) => format!(":{}\r\n", i).into_bytes(),
            RespValue::BulkString(s) => format!("${}\r\n{}\r\n", s.len(), s).into_bytes(),
            RespValue::Null => b"$-1\r\n".to_vec(),
            RespValue::Array(arr) => {
                let mut buf = Vec::new();
                buf.extend_from_slice(format!("*{}\r\n", arr.len()).as_bytes());
                for item in arr {
                    buf.extend_from_slice(item.serialize().as_ref());
                }
                buf
            }
        }
    }
}
```

Arrays are the interesting one here — they serialize recursively, writing the element count first and then each item's own serialization.

A `SET key value` command ends up looking like `*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nvalue\r\n`.

## Parsing Logic

I used [std::io::Cursor](https://doc.rust-lang.org/std/io/struct.Cursor.html) to walk through the raw byte buffer. The first byte tells us the type, then we dispatch to a type-specific parser.

```rust
pub fn parse_resp(cursor: &mut Cursor<&[u8]>) -> Result<RespValue, String> {
    let mut type_byte = [0; 1];

    if cursor
        .read(&mut type_byte)
        .map_err(|_| "Failed to read type byte")?
        == 0
    {
        return Err("EOF".to_string());
    }

    match type_byte[0] {
        b'+' => parse_simple_string(cursor),
        b'-' => parse_error(cursor),
        b':' => parse_integer(cursor),
        b'$' => parse_bulk_string(cursor),
        b'*' => parse_array(cursor),
        _ => Err(format!("Unknown RESP type: {}", type_byte[0] as char)),
    }
}
```