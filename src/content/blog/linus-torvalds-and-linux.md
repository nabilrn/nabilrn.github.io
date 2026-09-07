---
title: "I Used Linux Before I Cared Who Built It"
description: "I had already been using Linux, Git, Docker, and Ubuntu servers for years before I spent time learning about Linus Torvalds. His story changed how I think about engineering work."
pubDate: "2026-08-01"
tags: ["Tech", "History", "Open Source"]
---

I used Linux long before I cared who made it.

For me, Linux first showed up as infrastructure. <a href="https://ubuntu.com/" target="_blank" rel="noopener noreferrer">Ubuntu</a> VMs, <a href="https://docs.docker.com/" target="_blank" rel="noopener noreferrer">Docker</a> hosts, servers in the lab, <a href="https://www.openssh.com/" target="_blank" rel="noopener noreferrer">SSH</a> sessions, package updates, logs, services, and the usual things you touch when you start working around systems. <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer">Git</a> was even more invisible. I typed `git pull`, created branches, fixed conflicts, and pushed code without thinking much about the person who originally built the tool.

Only later did I spend time reading about **Linus Torvalds**. What caught my attention was not the usual “one person changed the world” story. It was how practical the origin of both Linux and Git was: in both cases there was a real engineering problem, the available tools were not good enough for what he needed, so he built something better. That part feels much more interesting to me than the mythology around famous programmers.

## Linux started as a personal problem

In 1991, Linus was a computer science student at the University of Helsinki. He had been using <a href="https://www.minix3.org/" target="_blank" rel="noopener noreferrer">MINIX</a>, a small Unix-like operating system designed mainly for education, and wanted more control over the system he was running. So he started writing his own kernel.

His announcement on Usenet became famous partly because of how small his expectations sounded:

> “I'm doing a (free) operating system (just a hobby, won't be big and professional like GNU).”

That aged badly in the best possible way. Linux did not become important because one person kept writing every part of it forever. It became useful because other developers could inspect it, modify it, send patches, add hardware support, fix bugs, and keep improving it.

That is the part of open source I find easy to underestimate when I am just consuming the result. You install Ubuntu, pull a container image, boot a server, or deploy an application and everything already feels finished. You rarely see the enormous amount of maintenance underneath it.

## I mostly encounter Linux when something needs to run

I do not use Linux because I have some ideological attachment to an operating system. I use it because a lot of infrastructure work eventually puts Linux in front of me. A VM needs an OS. A Docker host needs somewhere to run. A server needs SSH, systemd, logs, networking, permissions, packages, and processes that can survive after I close my terminal. That is usually where Linux appears.

The same thing happens at a much larger scale. Linux is widely used on servers and cloud infrastructure. Android is built on the <a href="https://www.kernel.org/" target="_blank" rel="noopener noreferrer">Linux kernel</a>. It also appears in embedded systems, networking equipment, and supercomputers.

The funny part is that successful infrastructure becomes boring. When it works, nobody thinks about it. The application is what users see, while the operating system underneath it disappears into the background. I actually like that. Infrastructure is often doing its job best when nobody has to talk about it.

## Then there is Git

Git is probably the stronger reason Linus became personally interesting to me. By 2005, Linux kernel development had a version-control problem. The project had grown far beyond something that could be coordinated casually, so Linus built Git to support the development workflow the kernel needed.

Today I use Git constantly, and that creates a strange feeling when you think about it. A tool I treat almost like basic plumbing was created because another engineering project had become difficult to manage.

Git also shows something I like about good engineering tools: the useful part is not that the implementation is clever. The useful part is that it solves a painful coordination problem so well that later developers stop thinking of the problem as unusual. Branches, commits, merges, distributed history, and repositories are normal parts of software development now. I learned them as basic workflow, not as some major historical breakthrough. That is usually what happens when a technical idea wins: the next generation receives it as a default.

## What I actually take from Linus

I do not think the useful lesson is “be like Linus” or “build the next Linux.” That kind of conclusion is too easy. What I take from his work is much smaller: **understand the problem before becoming attached to the tool**.

Linux came from wanting more control over a system. Git came from needing a better way to manage kernel development. Neither story starts with “I want to launch a product category.” They start with a concrete technical constraint. That mindset matters to me because it is easy in tech to work backwards: we find Kubernetes, AI, a new framework, a database, or some infrastructure tool and then search for a reason to use it. I have done that too.

The better projects usually go the other direction. There is an annoying problem first. You understand why it exists. Then you decide whether an existing tool is enough. Sometimes it is. Sometimes you need to build something. That sounds obvious, but it is surprisingly easy to forget.

I still do not know Linux deeply enough to call myself a Linux expert, and I definitely do not understand the kernel at the level of the people who maintain it. Most of my interaction with Linux is much more ordinary: deploying things, configuring servers, debugging services, and trying not to break networking at the wrong time. But now, when I SSH into another Ubuntu VM or type another Git command, I occasionally remember that both tools came from someone being dissatisfied with the tooling in front of him and deciding to work on the problem.

I think that is enough of a reason to know who Linus Torvalds is.
