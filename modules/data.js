// ===================================
// Data Loader
// ===================================
export async function loadTimeline() {
    const response = await fetch('data/timeline.json');
    if (!response.ok) {
        throw new Error(`Failed to load timeline.json: ${response.status}`);
    }
    return response.json();
}