# Investing Journal

Check it out <a href="https://investing-journal.herokuapp.com" target="_blank">here</a>.

### Contents:

- [Idea behind this app](#idea-behind-this-app)
- [Terminologies - What are vaults, thesis, thesis points, attachments?](#terminologies---what-are-vaults-thesis-thesis-points-attachments)
- [Performance Audit and Optimizations](#performance-audit-and-optimizations)
  - [Measure first](#measure-first)
  - [Pre-Optimizations](#pre-optimizations)
  - [Post-Optimizations](#post-optimizations)
    - [Code Splitting](#code-splitting)
    - [Text Compression](#text-compression)
  - [What's Next](#whats-next)
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


### Performance Audit and Optimizations
#### Measure first
- Rule of thumb: If performance of an application is to be improved, it has to be measured first.

#### Pre-Optimizations
- Below is a lighthouse audit snapshot of the app which takes a good 5-6 seconds to load.
  <img width="665" alt="pre-optimizations-pagespeed-test" src="https://user-images.githubusercontent.com/39647029/182028844-86c3f2a8-7fa2-44dc-8d74-517c64dfa80c.png">

#### Post-Optimizations
#### Code Splitting
- Introduced code splitting which enables fetching the required javascript on the fly, thus reducing the initial JS bundle size.
- Pre Code Splitting
<img width="430" alt="nw-before-code-splitting" src="https://user-images.githubusercontent.com/39647029/184468142-ae231920-844e-4382-9b82-d74e76c4ee6f.png">

- Post Code Splitting
<img width="470" alt="nw-after-code-splitting" src="https://user-images.githubusercontent.com/39647029/184468156-f16fe82b-3ccb-4039-b35c-4791b8842f58.png">

- A Lighthouse audit post code splitting apparently reveals some improvements in metrics.
<img width="665" alt="lighthouse-after-code-splitting" src="https://user-images.githubusercontent.com/39647029/184468167-a14b38c6-6a6d-4003-a472-5d578d752505.png">


#### Text Compression
- Enabled compression (gzip) of text based resources like CSS, JS so as to minimize total bytes to be transferred over the network.
- Below snapshot of the network tab shows original vs compressed sizes of the files.
  <img width="470" alt="after-text-compression" src="https://user-images.githubusercontent.com/39647029/184468757-e88c1c3e-3498-4aa3-867c-7015ba9a1ff9.png">

- A significant bump in Lighthouse performance score is observed post text compression.
  <img width="665" alt="lighthouse-after-text-compression" src="https://user-images.githubusercontent.com/39647029/184468800-377386d9-ea78-4cea-a08e-01f0bd19d8b5.png">
  
  
#### What's Next?
- There is a whole lot of room for further optimizations:
<img width="665" alt="pagespeed-suggesstions-stage-2" src="https://user-images.githubusercontent.com/39647029/184469379-6a5bdde7-cf35-48b9-a8e8-3478fcf60080.png">

- Until next time!


### Running on local machine

- Clone/download.
- Install dependencies in both client and server folders
- start client and server with suitable start scripts and on suitable ports
- You won't be able to use MongoDB database and AWS S3 bucket storage unless you create and set them up. Refer documentations/youtube videos for that.
- If you made it till here, then either make .env file for the keys or enter the keys seperately at required places.


### Bug Reporting

- Feel free to raise issue/create a PR in case you find some bugs. Much appreciated🙌
