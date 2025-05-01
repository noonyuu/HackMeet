package config

import "time"

func CustomFormat(date []byte) (time.Time, error) {
	customDate := "2006-01-02 15:04:05"
	customFormat, err := time.Parse((customDate), string(date))
	if err != nil {
		return time.Time{}, err
	}
	return customFormat, nil
}
