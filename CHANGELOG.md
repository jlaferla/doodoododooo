# Changelog

All notable changes to FX Ping are documented in this file.

This project follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH).

## [1.0.0] - 2026-06-02

First tagged release. Establishes a baseline for future versioning.

### Added
- Environment-based configuration for backend API credentials
- Per-IP rate limiting on backend endpoints (60/min, 1000/hour)
- ProxyFix middleware for accurate client IP behind Heroku router
- Restricted CORS to known frontend origins

### Changed
- Cleaner error responses from backend endpoints

[1.0.0]: https://github.com/jlaferla/doodoododooo/releases/tag/v1.0.0
