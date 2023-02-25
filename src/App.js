import React from "react";
import { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

function Loader() {
	return <p className="message">Loading...</p>;
}

function App() {
	const [showForm, setShowForm] = useState(false);
	const [facts, setFacts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentCategory, setCurrentCategory] = useState("all");

	useEffect(
		function () {
			async function getFacts() {
				setIsLoading(true);

				let query = supabase.from("facts").select("*");

				if (currentCategory !== "all") query = query.eq("category", currentCategory);

				const { data: facts, error } = await query
					.order("votesInteresting", { ascending: false })
					.limit(100);

				if (!error) setFacts(facts);
				else alert("Problem getting data");
				setFacts(facts);
				setIsLoading(false);
			}
			getFacts();
		},
		[currentCategory]
	);

	return (
		<>
			<Header showForm={showForm} setShowForm={setShowForm} />

			{showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm} /> : null}

			<main className="main">
				<CategoryFilter setCurrentCategory={setCurrentCategory} />
				{isLoading ? <Loader /> : <FactList facts={facts} setFacts={setFacts} />}
			</main>
		</>
	);
}

function Header({ showForm, setShowForm }) {
	const appTitle = "Today I learned";

	return (
		<header className="header">
			<div className="logo">
				<img src="/logo.png" alt="today i Learned logo" height="68" width="68" />
				<h1>{appTitle}</h1>
			</div>

			<button className="btn btn-large btn-open" onClick={() => setShowForm((show) => !show)}>
				{showForm ? "Close" : "Share a fact"}
			</button>
		</header>
	);
}

const CATEGORIES = [
	{ name: "technology", color: "#3b82f6" },
	{ name: "science", color: "#16a34a" },
	{ name: "finance", color: "#ef4444" },
	{ name: "society", color: "#eab308" },
	{ name: "entertainment", color: "#db2777" },
	{ name: "health", color: "#14b8a6" },
	{ name: "history", color: "#f97316" },
	{ name: "news", color: "#8b5cf6" }
];

function isValidHttpUrl(string) {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
	const [text, setText] = useState("");
	const [source, setSource] = useState("");
	const [category, setCategory] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const textLength = text.length;

	async function handleSubmit(e) {
		//1. prevent browser reload
		e.preventDefault();
		console.log(text, source, category);

		//2. check if data is valid, if so create new fact
		if (text && isValidHttpUrl(source) && category && textLength <= 200) {
			//3. create new fact object
			// const newFact = {
			// 	id: Math.round(Math.random() * 1000000),
			// 	text,
			// 	source,
			// 	category,
			// 	votesInteresting: 0,
			// 	votesMindblowing: 0,
			// 	votesFalse: 0,
			// 	createdIn: new Date().getFullYear()
			// };

			//3. upload fact do supabase and receibe new fact obj
			setIsUploading(true);
			const { data: newFact, error } = await supabase
				.from("facts")
				.insert([{ text, source, category }])
				.select();
			setIsUploading(false);

			//4. add new fact to the UI: add fact to state
			if (!error) setFacts((facts) => [newFact[0], ...facts]);

			//5. Reset input fields
			setText("");
			setSource("");
			setCategory("");

			//6. close the form
			setShowForm(false);
		}
	}

	return (
		<form className="fact-form" onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Share a fact with the world"
				value={text}
				onChange={(e) => setText(e.target.value)}
				disabled={isUploading}
			/>
			<span>{200 - textLength}</span>
			<input
				value={source}
				type="text"
				placeholder="Trustworthy source..."
				onChange={(e) => setSource(e.target.value)}
			/>
			<select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isUploading}>
				<option value="">Choose category:</option>
				{CATEGORIES.map((cat) => (
					<option key={cat.name} value={cat.name}>
						{cat.name.toUpperCase()}
					</option>
				))}
			</select>
			<button className="btn btn-large" disabled={isUploading}>
				Post
			</button>
		</form>
	);
}

function CategoryFilter({ setCurrentCategory }) {
	return (
		<aside>
			<ul>
				<li className="category">
					<button className="btn btn-all-categories" onClick={() => setCurrentCategory("all")}>
						All
					</button>
				</li>

				{CATEGORIES.map((cat) => (
					<li key={cat.name} className="category">
						<button
							className="btn btn-category"
							style={{ backgroundColor: cat.color }}
							onClick={() => setCurrentCategory(cat.name)}
						>
							{cat.name}
						</button>
					</li>
				))}
			</ul>
		</aside>
	);
}

function FactList({ facts, setFacts }) {
	if (facts.length === 0) {
		return <p className="message">No Facts for this category yet! Create one on your own!</p>;
	}

	return (
		<section>
			<ul className="facts-list">
				{facts.map((fact) => (
					<Fact key={fact.id} fact={fact} setFacts={setFacts} />
				))}
			</ul>
			<p>There are {facts.length} facts in the database. Add your own!</p>
		</section>
	);
}

function Fact({ fact, setFacts }) {
	const [isUpdating, setIsUpdating] = useState(false);
	const isDisputed = fact.votesInteresting + fact.votesMindBlowing < fact.votesFalse;

	async function handleVote(columnName) {
		setIsUpdating(true);
		const { data: updatedfact, error } = await supabase
			.from("facts")
			.update({ [columnName]: fact[columnName] + 1 })
			.eq("id", fact.id)
			.select();
		setIsUpdating(false);
		if (!error) setFacts((facts) => facts.map((f) => (f.id === fact.id ? updatedfact[0] : f)));
	}

	return (
		<li className="fact">
			<p>
				{isDisputed ? <span className="disputed">[⛔ DISPUTED]</span> : null}
				{fact.text}
				<a className="source" href={fact.source} target="_blank" rel="noreferrer">
					(Source)
				</a>
			</p>
			<span
				className="tag"
				style={{
					backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category).color
				}}
			>
				{fact.category}
			</span>
			<div className="vote-buttons">
				<button onClick={() => handleVote("votesInteresting")} disabled={isUpdating} type="button">
					👍 {fact.votesInteresting}
				</button>
				<button onClick={() => handleVote("votesMindBlowing")} disabled={isUpdating} type="button">
					🤯 {fact.votesMindBlowing}
				</button>
				<button onClick={() => handleVote("votesFalse")} disabled={isUpdating} type="button">
					⛔️ {fact.votesFalse}
				</button>
			</div>
		</li>
	);
}

export default App;
