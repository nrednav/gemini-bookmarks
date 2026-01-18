# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.1] - 2026-01-18

### Fixed

- Fixed an initialization deadlock where the application froze on the homepage
  - Removed a blocking dependency on the presence of model response containers

## [v1.1.0] - 2025-07-06

### Added

- Added delete button to each bookmark item in the UI side panel
  - This is meant to complement the "clear all" button and allow users to remove
    individual bookmarks from anywhere on the page, instead of having to scroll
    to the bookmark before being able to remove it

### Fixed

- Fixed a bug where bookmarked responses would be empty ("...") and fail on page
  refresh
  - This was because it would not wait for all the text to finish streaming in
    and the bookmark content was being determined earlier, at _render time_
    instead of _click time_

## [v1.0.0] - 2025-06-20

First release
