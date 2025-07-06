# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.0] - 2025-07-06

### Added

### Fixed

- Fixed a bug where bookmarked responses would be empty ("...") and fail on page
  refresh
  - This was because it would not wait for all the text to finish streaming in
    and the bookmark content was being determined earlier, at _render time_
    instead of _click time_

## [v1.0.0] - 2025-06-20

First release
