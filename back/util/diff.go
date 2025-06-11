package util

func CalculateDiff(current, new []string) (toAdd, toRemove []string) {
	currentSet := make(map[string]bool)
	for _, item := range current {
		currentSet[item] = true
	}
	newSet := make(map[string]bool)
	for _, item := range new {
		newSet[item] = true
		if !currentSet[item] {
			toAdd = append(toAdd, item)
		}
	}
	for _, item := range current {
		if !newSet[item] {
			toRemove = append(toRemove, item)
		}
	}
	return
}
