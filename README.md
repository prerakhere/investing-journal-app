# Investing Journal

Check it out <a href="https://investing-journal.herokuapp.com" target="_blank">here</a>.

### Contents:

- [Idea behind this app](#idea-behind-this-app)
- [Terminologies - What are vaults, thesis, thesis points, attachments?](#terminologies---what-are-vaults-thesis-thesis-points-attachments)
- [Running on local machine](#running-on-local-machine)
- [Bug Reporting](#bug-reporting)

### Idea behind this app

People get into 'stock tips' and invest in companies that they don't understand. What actually should drive their investments is their own investment thesis (at least
if they are investing for a longer term) of the investee companies and their future developments that will
generate revenues and profits. Through this app, one can journal out why they invested and are currently investing in companies by tracking them in a timelined manner.

### Terminologies - What are vaults, thesis, thesis points, attachments?

- Vault: A fancy equivalent of a company. So, Company's Name = Vault Name. Company's Sector = Vault Sector.
- Thesis: A timelined collection of thesis points that essentially reflects the developments in a company.
- Thesis Point: For example, in the vault of Reliance Industries, one can have a thesis point like: Partnered with Future Retail that would increase (some metric here).
- Attachments: Files (PDFs, images, word documents, PPT files) that are a part of an investor's thesis for a particular thesis point. Continuing with the example above, attachments
  may include the official corporate announcements that investors get on stock exchanges websites about the partnership.

### Running on local machine

- Clone/download.
- Install dependencies in both client and server folders
- start client and server with suitable start scripts and on suitable ports
- You won't be able to use MongoDB database and AWS S3 bucket storage unless you create and set them up. Refer documentations/youtube videos for that.
- If you made it till here, then either make .env file for the keys or enter the keys seperately at required places.

### Bug Reporting

- Feel free to raise issue/create a PR in case you find some bugs. Much appreciated🙌
