from typing import List, Dict, Any

DEFAULT_RESOURCES: Dict[str, List[Dict[str, Any]]] = {
    "sql": [
        {
            "title": "Relational Queries & Filtering Reference",
            "provider": "PostgreSQL Documentation",
            "url": "https://www.postgresql.org/docs/current/tutorial-sql.html",
            "type": "Documentation",
            "time": "25 min",
            "difficulty": "Core",
            "description": "Essential syntax for SELECT, WHERE, GROUP BY, and HAVING.",
        },
        {
            "title": "Window Functions & Multi-Table Joins Interactive Guide",
            "provider": "Mode Analytics",
            "url": "https://mode.com/sql-tutorial/sql-window-functions",
            "type": "Guide",
            "time": "30 min",
            "difficulty": "Advanced",
            "description": "Mastering partition offsets, ranking, and complex analytical joins.",
        },
    ],
    "statistics": [
        {
            "title": "Practical Business Statistics for Product Analysts",
            "provider": "EduPath Curriculum",
            "url": "https://openintro-ims.netlify.app/",
            "type": "Handbook",
            "time": "45 min",
            "difficulty": "Intermediate",
            "description": "Probability distributions, central limit theorem, and p-values.",
        },
        {
            "title": "A/B Testing & Hypothesis Testing Worked Examples",
            "provider": "Towards Data Science",
            "url": "https://towardsdatascience.com/ab-testing-with-python",
            "type": "Case Study",
            "time": "35 min",
            "difficulty": "Intermediate",
            "description": "Calculating statistical significance and standard error in experiment datasets.",
        },
    ],
    "power bi": [
        {
            "title": "DAX Formula Essentials & Time Intelligence",
            "provider": "Microsoft Learn",
            "url": "https://learn.microsoft.com/en-us/dax/",
            "type": "Reference",
            "time": "30 min",
            "difficulty": "Intermediate",
            "description": "Calculated columns, measures, and relational star-schema data modeling.",
        },
        {
            "title": "Designing Clean Executive Dashboards",
            "provider": "Enterprise DNA",
            "url": "https://enterprisedna.co/power-bi-dashboard-design/",
            "type": "Guide",
            "time": "25 min",
            "difficulty": "Intermediate",
            "description": "Information hierarchy and KPI design patterns for leadership.",
        },
    ],
    "python": [
        {
            "title": "Pandas Data Manipulation & Vectorized Operations",
            "provider": "Real Python",
            "url": "https://realpython.com/pandas-python-explore-dataset/",
            "type": "Guide",
            "time": "40 min",
            "difficulty": "Intermediate",
            "description": "Dataframe indexing, aggregation, cleaning, and export pipelines.",
        },
    ],
    "react": [
        {
            "title": "React 19 Official Documentation & Hooks Deep Dive",
            "provider": "React Team",
            "url": "https://react.dev",
            "type": "Documentation",
            "time": "30 min",
            "difficulty": "Intermediate",
            "description": "Modern state management, hooks lifecycle, and component composition.",
        },
    ],
    "typescript": [
        {
            "title": "TypeScript for JavaScript Programmers Handbook",
            "provider": "Microsoft",
            "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
            "type": "Handbook",
            "time": "35 min",
            "difficulty": "Intermediate",
            "description": "Interface contracts, generics, unions, and strict compiler configurations.",
        },
    ],
}

class ResourceService:
    def get_resources_for_skill(self, skill_name: str) -> List[Dict[str, Any]]:
        normalized = skill_name.lower().strip()
        for key, res_list in DEFAULT_RESOURCES.items():
            if key in normalized or normalized in key:
                return res_list
        return [
            {
                "title": f"{skill_name} Technical Handbook & Specification",
                "provider": "Official Documentation",
                "url": "https://devdocs.io",
                "type": "Documentation",
                "time": "30 min",
                "difficulty": "Intermediate",
                "description": f"Comprehensive guide to core concepts and real-world patterns in {skill_name}.",
            }
        ]

resource_service = ResourceService()
